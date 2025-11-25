## 1. Where do the DAOs live?

| Package            | Responsibility                                                                                                                                               | Why it belongs there                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **tweeter‑shared** | _Pure_ domain contracts – the **interfaces** that describe what a DAO can do (e.g. `UserDao`, `TweetDao`, `FeedDao`, `S3Dao`).                               | Shared between client and server so that type‑checking and _compile‑time_ guarantees are available everywhere. No runtime logic belongs here. |
| **tweeter‑server** | _Concrete_ implementations – classes that talk to DynamoDB / S3, the abstract factory / DI wiring, and the _factories_ that hand out the right DAO instance. | These are AWS‑specific, require the AWS SDK, and contain the logic to serialise/deserialize items. They should not leak into the front‑end.   |

> **Bottom line:**  
> • **Interfaces → tweeter‑shared**  
> • **Implementations + factories → tweeter‑server**

---

## 2. What should a DAO look like? (Interface)

```ts
// tweeter-shared/src/dao/UserDao.ts
export interface UserDao {
  /** Find a user by the public user name. */
  findByUsername(username: string): Promise<User | null>;

  /** Store or update a user record. */
  upsert(user: User): Promise<void>;

  /** Delete a user. */
  delete(username: string): Promise<void>;
}
```

Do the same for:

- `TweetDao` – CRUD for tweets, write to “tweets” table and also write feed entries
- `FeedDao` – read a _pre‑computed_ feed (query by userId + timestamp)
- `S3Dao` – upload, delete, get presigned URL

> _Why not an abstract class?_  
> An abstract class would carry implementation details (e.g. a protected `dynamoClient` field).  
> Interfaces give you a _pure contract_ and let the server decide whether it wants to implement it via a class, a function, or a Proxy.  
> If you need _common helper methods_ you can expose them in a separate utility module or use a generic base class _inside the server_ (but that still lives in tweeter‑server).

---

## 3. How to wire the DAOs into services?

### Option A – Abstract‑Factory

```ts
// tweeter-server/src/factory/DaoFactory.ts
export interface DaoFactory {
  userDao(): UserDao;
  tweetDao(): TweetDao;
  feedDao(): FeedDao;
  s3Dao(): S3Dao;
}
```

Implementation:

```ts
// tweeter-server/src/factory/DynamoDaoFactory.ts
export class DynamoDaoFactory implements DaoFactory {
  constructor(
    private readonly db: DynamoDBDocumentClient,
    private readonly s3: S3Client
  ) {}

  userDao(): UserDao {
    return new DynamoUserDao(this.db);
  }
  tweetDao(): TweetDao {
    return new DynamoTweetDao(this.db);
  }
  feedDao(): FeedDao {
    return new DynamoFeedDao(this.db);
  }
  s3Dao(): S3Dao {
    return new S3DaoImpl(this.s3);
  }
}
```

**Service usage**

```ts
export class TweetService {
  constructor(private readonly daoFactory: DaoFactory) {}

  async postTweet(userId: string, text: string) {
    const tweet = await this.daoFactory.tweetDao().create({ userId, text });
    // ... write to feed tables for followers
  }
}
```

### Option B – Dependency Injection (DI)

If you prefer a DI container (e.g. `tsyringe`, `inversify`, or your own lightweight injector):

```ts
@injectable()
class TweetService {
  constructor(
    @inject("UserDao") private readonly userDao: UserDao,
    @inject("TweetDao") private readonly tweetDao: TweetDao,
    @inject("FeedDao") private readonly feedDao: FeedDao
  ) {}
}
```

At bootstrap you bind the tokens to the DynamoDB implementations:

```ts
container.registerSingleton("UserDao", () => new DynamoUserDao(dbClient));
container.registerSingleton("TweetDao", () => new DynamoTweetDao(dbClient));
```

> _Why DI?_  
> • Keeps services agnostic of the concrete database provider.  
> • Makes unit‑testing trivial (inject a mock DAO).  
> • Enables swapping the entire persistence layer (e.g. to PostgreSQL) with a new factory / container registration.

---

## 4. Concrete DAO implementations (examples)

```ts
// tweeter-server/src/dao/dynamo/DynamoUserDao.ts
import { UserDao } from "tweeter-shared";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";

export class DynamoUserDao implements UserDao {
  constructor(private readonly db: DynamoDBDocumentClient) {}

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.db.send(
      new GetCommand({
        TableName: "Users",
        Key: { username },
      })
    );
    return result.Item as User | null;
  }

  async upsert(user: User): Promise<void> {
    await this.db.send(
      new PutCommand({
        TableName: "Users",
        Item: user,
      })
    );
  }

  async delete(username: string): Promise<void> {
    await this.db.send(
      new DeleteCommand({
        TableName: "Users",
        Key: { username },
      })
    );
  }
}
```

Similar classes for `TweetDao`, `FeedDao`, and `S3DaoImpl` (using `@aws-sdk/client-s3`).  
Each DAO should:

1. Use _batch_ commands when you need to write many feed items at once (e.g. when a user posts a tweet – write to the posting user’s feed **and** to every follower’s feed in a single batch‑write).
2. Handle errors – throw a custom `DaoError` that the service layer translates into an API‑level error response.

---

## 5. DynamoDB table design (high‑level)

| Table       | Partition key | Sort key     | Purpose                                                                                             |
| ----------- | ------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `Users`     | `username`    | –            | Stores profile data (hashed password, avatar URL, …)                                                |
| `Tweets`    | `tweetId`     | –            | Stores raw tweet objects                                                                            |
| `Followers` | `userId`      | `followerId` | 1‑to‑many mapping for following relationships                                                       |
| `Feeds`     | `userId`      | `timestamp`  | **Pre‑computed** feed items (tweetId + metadata). Query by `userId` & `timestamp` to page.          |
| `S3Images`  | `userId`      | `imageKey`   | Metadata about uploaded images (URL, timestamp). Optional – you can store URLs directly in `Users`. |

> **Tip** – If you’re worried about read throughput on the `Feeds` table, add a global secondary index (GSI) on `tweetId` so that you can query the _reverse_ direction if needed.

---

## 6. S3 DAO

```ts
// tweeter-server/src/dao/dynamo/S3DaoImpl.ts
import { S3Dao } from "tweeter-shared";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

export class S3DaoImpl implements S3Dao {
  constructor(private readonly s3: S3Client, private readonly bucket: string) {}

  async uploadProfileImage(
    userId: string,
    file: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `avatars/${userId}/${Date.now()}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}
```

Use this DAO in your `AuthService` or `ProfileService` when handling image uploads.

---

## 7. Unit‑testing a service with a mock DAO

```ts
class MockUserDao implements UserDao {
  private store = new Map<string, User>();
  async findByUsername(u: string) {
    return this.store.get(u) ?? null;
  }
  async upsert(u: User) {
    this.store.set(u.username, u);
  }
  async delete(u: string) {
    this.store.delete(u);
  }
}
```

```ts
const daoFactory = {
  userDao: () => new MockUserDao(),
  tweetDao: () => new MockTweetDao(),
  feedDao: () => new MockFeedDao(),
  s3Dao: () => new MockS3Dao(),
};

const service = new TweetService(daoFactory);
// run tests – no AWS calls
```

---

## 8. Summary of the “high‑level plan”

| Step | What you do                                                                                                  | Where                              |
| ---- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| 1    | Define **pure DAO interfaces** in `tweeter-shared`.                                                          | shared                             |
| 2    | Create **DynamoDB implementations** (`DynamoUserDao`, `DynamoTweetDao`, …) plus `S3DaoImpl`.                 | server                             |
| 3    | Expose a **factory** (`DaoFactory`) or a **DI container** that constructs the Dynamo implementations.        | server                             |
| 4    | Refactor all service classes to **accept the DAO interface** via constructor injection (or via the factory). | server                             |
| 5    | Add **error handling** and **batch writes** for feed updates.                                                | server                             |
| 6    | Design and create the Dynamo tables (`Users`, `Tweets`, `Followers`, `Feeds`).                               | AWS console / CDK / CloudFormation |
| 7    | Write unit tests that **mock the DAO interfaces**.                                                           | server                             |

> **Result:**  
> _Your services never know “DynamoDB” or “S3”; they only depend on abstract contracts._  
> _If you later decide to swap to PostgreSQL, you just write new DAO classes and change the factory/DI registrations._

---

### Quick‑reference code skeleton

```ts
// tweeter-shared/src/dao/index.ts
export * from "./UserDao";
export * from "./TweetDao";
export * from "./FeedDao";
export * from "./S3Dao";

// tweeter-server/src/dao/dynamo/index.ts
export * from "./DynamoUserDao";
export * from "./DynamoTweetDao";
export * from "./DynamoFeedDao";
export * from "./S3DaoImpl";

// tweeter-server/src/factory/index.ts
export * from "./DaoFactory";
export * from "./DynamoDaoFactory";

// tweeter-server/src/services/TweetService.ts
export class TweetService {
  constructor(private readonly daoFactory: DaoFactory) {}
  // …
}
```

Feel free to adjust naming conventions (`IUserDao` vs `UserDao`, etc.) to match the existing style in your repo. Happy coding!

---

## Follow Table

For my system, I want to start out on the follow table integration because that is the only table that I have in aws rn. Interaction will be done through . What is the best way to start? What files should I make and what would the names of my functions for implimenting getting and setting following would be?

Below is a **step‑by‑step blueprint** for turning the current `FollowService` into a _real_ DynamoDB‑backed service.  
The idea is to keep the React front‑end untouched, while moving all persistence logic into a **Follow DAO** that lives in the server package.

---

## 1. What does the DynamoDB “follow” table look like?

| PK                  | SK                    | Attributes                                        |
| ------------------- | --------------------- | ------------------------------------------------- |
| `userId` (follower) | `followeeId`          | `createdAt` (ISO string), any other meta you need |
| **Optional GSI**    | `GSI1PK = followeeId` | `GSI1SK = followerId` (to query “who follows me”) |

_This schema gives you O(1) reads for “who I follow” and O(1) reads for “who follows me”._

---

## 2. Where to put the code

| Directory                                          | Responsibility                                     |
| -------------------------------------------------- | -------------------------------------------------- |
| `tweeter‑shared/src/dao/FollowDao.ts`              | **Pure interface** – no DB knowledge.              |
| `tweeter‑server/src/dao/dynamo/FollowDaoDynamo.ts` | Concrete DynamoDB implementation.                  |
| `tweeter‑server/src/factory/DaoFactory.ts`         | Factory that returns the implementation.           |
| `tweeter‑server/src/services/FollowService.ts`     | The existing service **modified** to call the DAO. |

> **Why not put the DAO in the client?**  
> The client never talks to DynamoDB; it only talks to the Lambda endpoints.  
> The DAO lives on the server, because it needs the AWS SDK and credentials.

---

## 3. The **DAO interface** (`tweeter‑shared/src/dao/FollowDao.ts`)

```ts
// tweeter-shared/src/dao/FollowDao.ts
import { UserDto } from "../model";

export interface FollowDao {
  /** Return all followees of a user (paged). */
  getFollowees(
    userAlias: string,
    limit: number,
    lastKey?: string
  ): Promise<{ items: UserDto[]; lastKey?: string }>;

  /** Return all followers of a user (paged). */
  getFollowers(
    userAlias: string,
    limit: number,
    lastKey?: string
  ): Promise<{ items: UserDto[]; lastKey?: string }>;

  /** Count how many users a user is following. */
  countFollowees(userAlias: string): Promise<number>;

  /** Count how many users are following a user. */
  countFollowers(userAlias: string): Promise<number>;

  /** Is *userAlias* following *followeeAlias*? */
  isFollowing(userAlias: string, followeeAlias: string): Promise<boolean>;

  /** Make *userAlias* follow *followeeAlias*. */
  addFollow(userAlias: string, followeeAlias: string): Promise<void>;

  /** Remove a follow relationship. */
  removeFollow(userAlias: string, followeeAlias: string): Promise<void>;
}
```

_All the methods are **database‑agnostic** – just return plain data._

---

## 4. The **DynamoDB implementation** (`tweeter‑server/src/dao/dynamo/FollowDaoDynamo.ts`)

```ts
// tweeter-server/src/dao/dynamo/FollowDaoDynamo.ts
import { FollowDao } from "tweeter-shared";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { UserDto } from "tweeter-shared";
import { User } from "tweeter-shared";

const FOLLOW_TABLE = "Follow";

export class FollowDaoDynamo implements FollowDao {
  constructor(private readonly db: DynamoDBDocumentClient) {}

  /* -------------- GETTERS -------------- */

  async getFollowees(userAlias: string, limit: number, lastKey?: string) {
    const params = {
      TableName: FOLLOW_TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userAlias },
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? { userId: userAlias, followeeId: lastKey }
        : undefined,
    };
    const result = await this.db.send(new QueryCommand(params));
    const items = result.Items?.map((i) => User.fromDto(i as UserDto)) ?? [];
    return {
      items: items.map((u) => u.dto),
      lastKey: result.LastEvaluatedKey?.followeeId,
    };
  }

  async getFollowers(userAlias: string, limit: number, lastKey?: string) {
    const params = {
      TableName: FOLLOW_TABLE,
      IndexName: "GSI1", // PK = followeeId, SK = followerId
      KeyConditionExpression: "followeeId = :u",
      ExpressionAttributeValues: { ":u": userAlias },
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? { followeeId: userAlias, followerId: lastKey }
        : undefined,
    };
    const result = await this.db.send(new QueryCommand(params));
    const items = result.Items?.map((i) => User.fromDto(i as UserDto)) ?? [];
    return {
      items: items.map((u) => u.dto),
      lastKey: result.LastEvaluatedKey?.followerId,
    };
  }

  /* -------------- COUNTERS -------------- */

  async countFollowees(userAlias: string) {
    const { items } = await this.getFollowees(
      userAlias,
      Number.MAX_SAFE_INTEGER
    );
    return items.length;
  }

  async countFollowers(userAlias: string) {
    const { items } = await this.getFollowers(
      userAlias,
      Number.MAX_SAFE_INTEGER
    );
    return items.length;
  }

  async isFollowing(userAlias: string, followeeAlias: string) {
    const params = {
      TableName: FOLLOW_TABLE,
      Key: { userId: userAlias, followeeId: followeeAlias },
    };
    const result = await this.db.send(new QueryCommand(params));
    return !!result.Items?.length;
  }

  /* -------------- MUTATIONS -------------- */

  async addFollow(userAlias: string, followeeAlias: string) {
    const item = {
      userId: userAlias,
      followeeId: followeeAlias,
      createdAt: new Date().toISOString(),
    };
    await this.db.send(
      new TransactWriteCommand({
        TransactItems: [{ Put: { TableName: FOLLOW_TABLE, Item: item } }],
      })
    );
  }

  async removeFollow(userAlias: string, followeeAlias: string) {
    await this.db.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Delete: {
              TableName: FOLLOW_TABLE,
              Key: { userId: userAlias, followeeId: followeeAlias },
            },
          },
        ],
      })
    );
  }
}
```

> **Tip** – Use **transactional writes** if you later decide to maintain a denormalized counter in another table (e.g. “followersCount”). For now a simple `Put` / `Delete` is fine.

---

## 5. The **Factory** (`tweeter‑server/src/factory/DaoFactory.ts`)

```ts
// tweeter-server/src/factory/DaoFactory.ts
import { FollowDao } from "tweeter-shared";
import { FollowDaoDynamo } from "../dao/dynamo/FollowDaoDynamo";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export interface DaoFactory {
  followDao(): FollowDao;
}

export class DynamoDaoFactory implements DaoFactory {
  private readonly db = DynamoDBDocumentClient.from({}); // configure region, credentials

  followDao(): FollowDao {
    return new FollowDaoDynamo(this.db);
  }
}
```

You can extend this factory later to expose other DAOs (Tweet, User, Feed, etc.).

---

## 6. Wire the factory into the Lambda bootstrap

In `src/handler.ts` (or wherever you initialise your Lambdas):

```ts
import { DynamoDaoFactory } from "./factory/DynamoDaoFactory";
import { FollowService } from "./services/FollowService";

const daoFactory = new DynamoDaoFactory();
const followService = new FollowService(daoFactory);
export const handler = followService.handler; // adjust to your routing scheme
```

---

## 7. Update **FollowService** (`tweeter‑server/src/services/FollowService.ts`)

Replace all the `FakeData` calls with calls to the DAO. The public API of `FollowService` stays the same, so the React front‑end needs no changes.

```ts
import { FollowDao } from "tweeter-shared";
import { AuthToken, UserDto } from "tweeter-shared";
import { Service } from "./Service";

export class FollowService implements Service {
  constructor(private readonly daoFactory: { followDao: () => FollowDao }) {}

  // ----- pagination helpers (unchanged) -----
  private async getPage(
    lastItem: UserDto | null,
    limit: number,
    alias: string,
    loadFunc: (
      alias: string,
      limit: number,
      lastKey?: string
    ) => Promise<{ items: UserDto[]; lastKey?: string }>
  ): Promise<[UserDto[], boolean]> {
    const lastKey = lastItem?.alias ?? undefined;
    const { items, lastKey: newLast } = await loadFunc(alias, limit, lastKey);
    return [items, !!newLast];
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ) {
    return this.getPage(
      lastItem,
      pageSize,
      userAlias,
      this.daoFactory.followDao().getFollowees.bind(this.daoFactory.followDao())
    );
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ) {
    return this.getPage(
      lastItem,
      pageSize,
      userAlias,
      this.daoFactory.followDao().getFollowers.bind(this.daoFactory.followDao())
    );
  }

  public async getFolloweeCount(token: string, user: UserDto) {
    return this.daoFactory.followDao().countFollowees(user.alias);
  }

  public async getFollowerCount(token: string, user: UserDto) {
    return this.daoFactory.followDao().countFollowers(user.alias);
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ) {
    return this.daoFactory
      .followDao()
      .isFollowing(user.alias, selectedUser.alias);
  }

  public async follow(token: string, userToFollow: UserDto) {
    await this.daoFactory
      .followDao()
      .addFollow(this.extractAliasFromToken(token), userToFollow.alias);
    return true;
  }

  public async unfollow(token: string, userToUnfollow: UserDto) {
    await this.daoFactory
      .followDao()
      .removeFollow(this.extractAliasFromToken(token), userToUnfollow.alias);
    return true;
  }

  /* helper – replace with your auth‑service later */
  private extractAliasFromToken(token: string): string {
    // TODO: decode JWT / auth token and return userAlias
    return token; // placeholder
  }
}
```

> **Why bind?**  
> `this.daoFactory.followDao()` returns a new instance each call. We capture the instance once per service call, then bind the DAO methods so the `loadPage` helper can stay generic.

---

## 8. Unit‑testing the service

Create a mock DAO:

```ts
// tweeter-server/test/mocks/MockFollowDao.ts
import { FollowDao } from "tweeter-shared";
import { UserDto } from "tweeter-shared";

export class MockFollowDao implements FollowDao {
  private follows = new Map<string, Set<string>>(); // follower → set of followees

  async getFollowees(userAlias: string, limit: number, lastKey?: string) {
    const set = this.follows.get(userAlias) ?? new Set();
    const arr = Array.from(set);
    const start = lastKey ? arr.indexOf(lastKey) + 1 : 0;
    const sliced = arr.slice(start, start + limit);
    const newLast =
      start + limit < arr.length ? sliced[sliced.length - 1] : undefined;
    const dtos = sliced.map(
      (a) => ({ alias: a, firstName: "", lastName: "" } as UserDto)
    );
    return { items: dtos, lastKey: newLast };
  }
  /* implement the rest in a similar way … */
}
```

Inject it into `FollowService` in the test and assert that the service still returns the correct `[UserDto[], boolean]` tuple.

---

## 9. One‑click **deployment**

1. **Create the table** in the _AWS console_ or via Terraform / CloudFormation:

   ```yaml
   Resources:
     FollowTable:
       Type: AWS::DynamoDB::Table
       Properties:
         TableName: Follow
         BillingMode: PAY_PER_REQUEST
         AttributeDefinitions:
           - AttributeName: userId
             AttributeType: S
           - AttributeName: followeeId
             AttributeType: S
           - AttributeName: followeeId # GSI PK
             AttributeType: S
           - AttributeName: followerId # GSI SK
             AttributeType: S
         KeySchema:
           - AttributeName: userId
             KeyType: HASH
           - AttributeName: followeeId
             KeyType: RANGE
         GlobalSecondaryIndexes:
           - IndexName: GSI1
             KeySchema:
               - AttributeName: followeeId
                 KeyType: HASH
               - AttributeName: followerId
                 KeyType: RANGE
             Projection:
               ProjectionType: ALL
   ```

2. **Build & deploy** the Lambda (`npm run build && aws lambda update-function-code …`).

3. Run a quick integration test from the browser:  
   _Open the “Follow” tab → click “Follow” → you should see the “follow” message after 2 s (or instantly if you removed the timeout)._

---

## 9. Road‑map (future extensions)

| Next step                                                                                                                                                                                       | Why |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| **Add authentication** – move `extractAliasFromToken` to a real `AuthService` that validates the JWT.                                                                                           |
| **Batch load** – DynamoDB pagination uses `LastEvaluatedKey`; adapt UI to pass that key instead of the last `UserDto`.                                                                          |
| **Denormalised counters** – if you need fast `countFollowees`/`countFollowers` without a full scan, add a _Counters_ table and wrap the DAO mutation in a transaction that updates both tables. |
| **Follow‑back‑analytics** – expose a `getFollowRelationship` endpoint that returns `createdAt` if you want to show “since when did we follow each other?”                                       |

---

### Quick file list you’ll create / touch

```
tweeter-shared/
└─ src/dao/FollowDao.ts          # DAO interface

tweeter-server/
├─ src/factory/DaoFactory.ts     # Factory
├─ src/factory/DynamoDaoFactory.ts
├─ src/dao/dynamo/FollowDaoDynamo.ts
└─ src/services/FollowService.ts  # updated to use DAO
```

**Functions you’ll implement (names)**

| File           | Function                           | Purpose                            |
| -------------- | ---------------------------------- | ---------------------------------- |
| `FollowDao.ts` | `getFollowees`, `getFollowers`     | Page through follow relationships. |
|                | `countFollowees`, `countFollowers` | Return counts.                     |
|                | `isFollowing`                      | Check relationship.                |
|                | `addFollow`, `removeFollow`        | Create/delete a follow.            |

All of these are called from `FollowService`, so **no function names change** in the public API. That means the React components you already have can keep calling `followService.loadMoreFollowees(...)` etc. – nothing in the client needs to know that the data now comes from DynamoDB instead of a fake in‑memory store.

---

**Next immediate step**

1. Spin up the DynamoDB table (if you haven’t already).
2. Add the four files above.
3. Replace the `FakeData` calls in `FollowService` with the DAO calls shown.
4. Wire the `DynamoDaoFactory` into your Lambda bootstrap.

That’s it – you now have a production‑ready “follow” persistence layer that is cleanly decoupled from the UI. Happy coding!
