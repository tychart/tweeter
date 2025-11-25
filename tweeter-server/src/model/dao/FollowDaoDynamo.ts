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

  async getFollowees(
    userAlias: string,
    limit: number,
    lastKey?: string
  ): Promise<{ items: UserDto[]; lastKey?: string }> {
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
      items: items.map((u) => u!.dto),
      lastKey: result.LastEvaluatedKey?.followeeId,
    };
  }

  async getFollowers(
    userAlias: string,
    limit: number,
    lastKey?: string
  ): Promise<{ items: UserDto[]; lastKey?: string }> {
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
      items: items.map((u) => u!.dto),
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
