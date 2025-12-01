import { Buffer } from "buffer";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

import { UserDto } from "tweeter-shared";
import { UserDao } from "../UserDao";

export class UserDaoDynamo implements UserDao {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  readonly BUCKET = "tychart-s3-test-bucket2";
  readonly REGION = "us-west-2";

  readonly tableName = "user";

  readonly aliasAttr = "alias";
  readonly firstNameAttr = "first_name";
  readonly lastNameAttr = "last_name";
  readonly passHashAttr = "password_hash";
  readonly imgUrlAttr = "img_url";
  readonly followeeCountAttr = "followee_count";
  readonly followerCountAttr = "follower_count";

  public async putUser(user: UserDto, passwordHash: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.aliasAttr]: user.alias,
        [this.firstNameAttr]: user.firstName,
        [this.lastNameAttr]: user.lastName,
        [this.imgUrlAttr]: user.imageUrl,
        [this.passHashAttr]: passwordHash,
        [this.followeeCountAttr]: 0,
        [this.followerCountAttr]: 0,
      },
    };
    await this.client.send(new PutCommand(params));

    return true;
  }

  public async putImage(
    fileName: string,
    imageStringBase64Encoded: string
  ): Promise<string> {
    let decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64"
    );
    const s3Params = {
      Bucket: this.BUCKET,
      Key: "image/" + fileName,
      Body: decodedImageBuffer,
      ContentType: "image/png",
      ACL: ObjectCannedACL.public_read,
    };
    const c = new PutObjectCommand(s3Params);
    const client = new S3Client({ region: this.REGION });
    try {
      await client.send(c);
      return `https://${this.BUCKET}.s3.${this.REGION}.amazonaws.com/image/${fileName}`;
    } catch (error) {
      throw Error("s3 put image failed with: " + error);
    }
  }

  public async getUser(alias: string): Promise<UserDto | undefined> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttr]: alias,
      },
    };

    // console.log("This is a test to see before stuff");

    // console.log("Params being sent for getting a user: ", params);

    // const getCommand = ;

    // console.log("This is the get command: ", getCommand);

    const response = await this.client.send(new GetCommand(params));

    // console.log("Response from dynamo for getting a user: ", response);
    // console.log("This is a test to see stuff");

    if (response.Item) {
      return {
        alias: response.Item[this.aliasAttr],
        firstName: response.Item[this.firstNameAttr],
        lastName: response.Item[this.lastNameAttr],
        imageUrl: response.Item[this.imgUrlAttr],
      };
    }

    return undefined;
  }

  public async getFullUser(alias: string): Promise<
    | {
        userDto: UserDto;
        passHash: string;
        followeeCount: number;
        followerCount: number;
      }
    | undefined
  > {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttr]: alias,
      },
    };

    // console.log("This is a test to see before stuff");

    // console.log("Params being sent for getting a user: ", params);

    // const getCommand = ;

    // console.log("This is the get command: ", getCommand);

    const response = await this.client.send(new GetCommand(params));

    // console.log("Response from dynamo for getting a user: ", response);
    // console.log("This is a test to see stuff");

    if (response.Item) {
      const returnedUserDto: UserDto = {
        alias: response.Item[this.aliasAttr],
        firstName: response.Item[this.firstNameAttr],
        lastName: response.Item[this.lastNameAttr],
        imageUrl: response.Item[this.imgUrlAttr],
      };

      const passwordHash: string | undefined = response.Item[this.passHashAttr];

      const followeeCount: number | undefined =
        response.Item[this.followeeCountAttr];

      const followerCount: number | undefined =
        response.Item[this.followerCountAttr];

      if (
        returnedUserDto === undefined ||
        passwordHash === undefined ||
        followeeCount === undefined ||
        followerCount === undefined
      ) {
        return undefined;
      }

      return {
        userDto: returnedUserDto,
        passHash: passwordHash,
        followeeCount: followeeCount,
        followerCount: followerCount,
      };
    }

    return undefined;
  }

  public async updateFolloweeCount(
    alias: string,
    countChange: number
  ): Promise<void> {
    await this.updateUserCounts(alias, countChange, 0);
  }

  public async updateFollowerCount(
    alias: string,
    countChange: number
  ): Promise<void> {
    await this.updateUserCounts(alias, 0, countChange);
  }

  // private async updateUserCounts(
  //   alias: string,
  //   newFolloweeCount: number,
  //   newFollowerCount: number
  // ): Promise<void> {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: {
  //       [this.aliasAttr]: alias,
  //     },
  //     ExpressionAttributeValues: {
  //       ":new_followee_count": newFolloweeCount,
  //       ":new_follower_count": newFollowerCount,
  //     },
  //     UpdateExpression:
  //       "SET " +
  //       this.followeeCountAttr +
  //       " = :new_followee_count, " +
  //       this.followerCountAttr +
  //       " = :new_follower_count",
  //   };
  //   await this.client.send(new UpdateCommand(params));
  // }

  private async updateUserCounts(
    alias: string,
    followeeDelta: number,
    followerDelta: number
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.aliasAttr]: alias },
      ExpressionAttributeValues: {
        ":followee_delta": followeeDelta, // +1 or -1
        ":follower_delta": followerDelta, // +1 or -1
      },
      UpdateExpression: `ADD ${this.followeeCountAttr} :followee_delta, ${this.followerCountAttr} :follower_delta`,
    };
    await this.client.send(new UpdateCommand(params));
  }

  // public async deleteFollow(
  //   followerAlias: string,
  //   followeeAlias: string
  // ): Promise<void> {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: {
  //       [this.followerAliasAttr]: followerAlias,
  //       [this.followeeAliasAttr]: followeeAlias,
  //     },
  //   };
  //   await this.client.send(new DeleteCommand(params));
  // }

  // async getPageOfFollowees(
  //   pageSize: number,
  //   followerAlias: string,
  //   followeeAlias?: string | undefined
  // ): Promise<DataPageDto<FollowDto>> {
  //   const params = {
  //     KeyConditionExpression: this.followerAliasAttr + " = :v",
  //     ExpressionAttributeValues: {
  //       ":v": followerAlias,
  //     },
  //     TableName: this.tableName,
  //     Limit: pageSize,
  //     ExclusiveStartKey:
  //       followeeAlias === undefined
  //         ? undefined
  //         : {
  //             [this.followerAliasAttr]: followerAlias,
  //             [this.followeeAliasAttr]: followeeAlias,
  //           },
  //   };

  //   const items: FollowDto[] = [];
  //   const data = await this.client.send(new QueryCommand(params));
  //   const hasMorePages = data.LastEvaluatedKey !== undefined;
  //   data.Items?.forEach((item) =>
  //     items.push({
  //       followerAlias: item[this.followerAliasAttr],
  //       followerName: item[this.followerNameAttr],
  //       followeeAlias: item[this.followeeAliasAttr],
  //       followeeName: item[this.followeeNameAttr],
  //     })
  //   );
  //   return { values: items, hasMorePages: hasMorePages };
  // }

  // async getPageOfFollowers(
  //   pageSize: number,
  //   followeeAlias: string,
  //   lastfollowerAlias?: string | undefined
  // ): Promise<DataPageDto<FollowDto>> {
  //   const params = {
  //     KeyConditionExpression: this.followeeAliasAttr + " = :v",
  //     ExpressionAttributeValues: {
  //       ":v": followeeAlias,
  //     },
  //     TableName: this.tableName,
  //     IndexName: this.indexName,
  //     Limit: pageSize,
  //     ExclusiveStartKey:
  //       lastfollowerAlias === undefined
  //         ? undefined
  //         : {
  //             [this.followerAliasAttr]: lastfollowerAlias,
  //             [this.followeeAliasAttr]: followeeAlias,
  //           },
  //   };

  //   const items: FollowDto[] = [];
  //   const data = await this.client.send(new QueryCommand(params));
  //   const hasMorePages = data.LastEvaluatedKey !== undefined;
  //   data.Items?.forEach((item) =>
  //     items.push({
  //       followerAlias: item[this.followerAliasAttr],
  //       followerName: item[this.followerNameAttr],
  //       followeeAlias: item[this.followeeAliasAttr],
  //       followeeName: item[this.followeeNameAttr],
  //     })
  //   );
  //   return { values: items, hasMorePages: hasMorePages };
  // }
}
