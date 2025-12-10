import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { StatusDao } from "../StatusDao";
import { DataPageDto, SmallStatusDto, StatusDto } from "tweeter-shared";
import { FeedDao } from "../FeedDao";

export class FeedDaoDynamo implements FeedDao {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  readonly tableName = "feed";

  readonly aliasAttr = "alias";
  readonly timestampAttr = "timestamp";
  readonly authorAliasAttr = "author_alias";
  readonly postAttr = "post";

  public async putPost(
    alias: string,
    timestamp: number,
    authorAlias: string,
    post: string
  ): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.aliasAttr]: alias,
        [this.timestampAttr]: timestamp,
        [this.authorAliasAttr]: authorAlias,
        [this.postAttr]: post,
      },
    };
    await this.client.send(new PutCommand(params));

    return true;
  }

  public async getPost(
    token: string,
    timestamp: number
  ): Promise<[SmallStatusDto, string] | undefined> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttr]: token,
        [this.timestampAttr]: timestamp,
      },
    };

    const response = await this.client.send(new GetCommand(params));

    if (!response.Item) {
      return undefined;
    }

    return [
      {
        alias: response.Item[this.aliasAttr],
        timestamp: response.Item[this.timestampAttr],
        post: response.Item[this.postAttr],
      },
      response.Item[this.authorAliasAttr],
    ];
  }

  // public async validateAuth(token: string): Promise<[AuthToken, string]> {
  //   const LENGTH_OF_TIME_UNTIL_TOKEN_EXPIRES_MS = 10 * 60 * 1000;

  //   const authReturn = await this.getAuth(token);

  //   if (!authReturn) {
  //     throw new Error(
  //       `Error: unauthorized access - Authtoken provided was not found in the database`
  //     );
  //   }

  //   const [authToken, alias] = authReturn;

  //   if (
  //     authToken.timestamp + LENGTH_OF_TIME_UNTIL_TOKEN_EXPIRES_MS <
  //     Date.now()
  //   ) {
  //     // this.deleteAuth(token);
  //     throw new Error(
  //       `Error: unauthorized access - Token for user: ${alias} is expired`
  //     );
  //   }

  //   await this.updateAuthLastUsed(token);

  //   return [authToken, alias];
  // }

  // public async updateAuthLastUsed(token: string): Promise<void> {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: {
  //       [this.tokenAttr]: token,
  //     },
  //     ExpressionAttributeValues: {
  //       ":current_time": Date.now(),
  //     },
  //     UpdateExpression: "SET " + this.lastUsedAttr + " = :current_time",
  //   };
  //   await this.client.send(new UpdateCommand(params));
  // }

  // public async deleteAuth(token: string): Promise<void> {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: {
  //       [this.tokenAttr]: token,
  //     },
  //   };
  //   await this.client.send(new DeleteCommand(params));
  // }

  async getPageOfFeed(
    pageSize: number,
    alias: string,
    lastTimestamp?: number | undefined
  ): Promise<DataPageDto<SmallStatusDto>> {
    console.log("--------------------");
    console.log("Inside of getPageOfFeed");
    console.log("alias: ", alias);
    console.log("lastTimestamp: ", lastTimestamp);

    const params = {
      KeyConditionExpression: this.aliasAttr + " = :v",
      ExpressionAttributeValues: {
        ":v": alias,
      },
      TableName: this.tableName,
      Limit: pageSize,
      ExclusiveStartKey:
        lastTimestamp === undefined
          ? undefined
          : {
              [this.aliasAttr]: alias,
              [this.timestampAttr]: lastTimestamp,
            },
      ScanIndexForward: false,
    };

    console.log("params: ", params);

    const items: SmallStatusDto[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push({
        alias: item[this.authorAliasAttr],
        timestamp: item[this.timestampAttr],
        post: item[this.postAttr],
      })
    );
    return { values: items, hasMorePages: hasMorePages };
  }

  async putBatchFeed(
    authorAlias: string,
    timestamp: number,
    post: string,
    followerAliases: string[]
  ): Promise<boolean> {
    let putRequestList = [];

    // console.log(
    //   "Got into batch feed with input: ",
    //   authorAlias,
    //   timestamp,
    //   post,
    //   followerAliases
    // );

    for (const alias of followerAliases) {
      putRequestList.push({
        PutRequest: {
          Item: {
            [this.aliasAttr]: alias,
            [this.timestampAttr]: timestamp,
            [this.authorAliasAttr]: authorAlias,
            [this.postAttr]: post,
          },
        },
      });
    }

    // console.log("Final putRequestList for batch write: ", putRequestList);

    const params: BatchWriteCommandInput = {
      RequestItems: {
        [this.tableName]: putRequestList,
      },
    };

    await this.client.send(new BatchWriteCommand(params));

    // console.log(
    //   "If you can see this, then that means that the await was proper for waiting until after the batch request was sent"
    // );

    return true;
  }

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
