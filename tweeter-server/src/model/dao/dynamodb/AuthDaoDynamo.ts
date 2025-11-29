import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { AuthToken, UserDto } from "tweeter-shared";
import { UserDao } from "../UserDao";
import { AuthDao } from "../AuthDao";

export class AuthDaoDynamo implements AuthDao {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  readonly tableName = "auth";

  readonly tokenAttr = "token";
  readonly aliasAttr = "alias";
  readonly lastUsedAttr = "last_used";

  public async putAuth(authToken: AuthToken, alias: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.tokenAttr]: authToken.token,
        [this.aliasAttr]: alias,
        [this.lastUsedAttr]: authToken.timestamp,
      },
    };
    await this.client.send(new PutCommand(params));

    return true;
  }

  public async getAuth(
    token: string
  ): Promise<[AuthToken, string] | undefined> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.tokenAttr]: token,
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
      const returnedAuthToken = new AuthToken(
        response.Item[this.tokenAttr],
        response.Item[this.lastUsedAttr]
      );

      return [returnedAuthToken, response.Item[this.aliasAttr]];
    }

    return undefined;
  }

  // public async updateFollow(
  //   followerAlias: string,
  //   follower_name: string,
  //   followeeAlias: string,
  //   followee_name: string
  // ): Promise<void> {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: {
  //       [this.followerAliasAttr]: followerAlias,
  //       [this.followeeAliasAttr]: followeeAlias,
  //     },
  //     ExpressionAttributeValues: {
  //       ":follower_name": follower_name,
  //       ":followee_name": followee_name,
  //     },
  //     UpdateExpression:
  //       "SET " +
  //       this.followerNameAttr +
  //       " = :follower_name, " +
  //       this.followeeNameAttr +
  //       " = :followee_name",
  //   };
  //   await this.client.send(new UpdateCommand(params));
  // }

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
