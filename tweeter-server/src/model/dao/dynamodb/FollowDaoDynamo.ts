import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DataPageDto, FollowDto, Follow } from "tweeter-shared";
import { FollowDao } from "../FollowDao";

export class FollowDaoDynamo implements FollowDao {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  readonly tableName = "follow";
  readonly indexName = "follow_index";

  readonly followerAliasAttr = "follower_alias";
  readonly followeeAliasAttr = "followee_alias";

  public async putFollow(follow: FollowDto): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.followerAliasAttr]: follow.followerAlias,
        [this.followeeAliasAttr]: follow.followeeAlias,
      },
    };
    await this.client.send(new PutCommand(params));

    return true;
  }

  public async getFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<FollowDto | undefined> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAliasAttr]: followerAlias,
        [this.followeeAliasAttr]: followeeAlias,
      },
    };
    const response = await this.client.send(new GetCommand(params));

    if (response.Item) {
      return {
        followerAlias: response.Item[this.followerAliasAttr],
        followeeAlias: response.Item[this.followeeAliasAttr],
      };
    }

    return undefined;
  }

  public async updateFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAliasAttr]: followerAlias,
        [this.followeeAliasAttr]: followeeAlias,
      },
    };
    await this.client.send(new UpdateCommand(params));
  }

  public async deleteFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAliasAttr]: followerAlias,
        [this.followeeAliasAttr]: followeeAlias,
      },
    };
    await this.client.send(new DeleteCommand(params));
  }

  async getPageOfFollowees(
    pageSize: number,
    followerAlias: string,
    followeeAlias?: string | undefined
  ): Promise<DataPageDto<FollowDto>> {
    const params = {
      KeyConditionExpression: this.followerAliasAttr + " = :v",
      ExpressionAttributeValues: {
        ":v": followerAlias,
      },
      TableName: this.tableName,
      Limit: pageSize,
      ExclusiveStartKey:
        followeeAlias === undefined
          ? undefined
          : {
              [this.followerAliasAttr]: followerAlias,
              [this.followeeAliasAttr]: followeeAlias,
            },
    };

    const items: FollowDto[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push({
        followerAlias: item[this.followerAliasAttr],
        followeeAlias: item[this.followeeAliasAttr],
      })
    );
    return { values: items, hasMorePages: hasMorePages };
  }

  async getPageOfFollowers(
    pageSize: number,
    followeeAlias: string,
    lastfollowerAlias?: string | undefined
  ): Promise<DataPageDto<FollowDto>> {
    const params = {
      KeyConditionExpression: this.followeeAliasAttr + " = :v",
      ExpressionAttributeValues: {
        ":v": followeeAlias,
      },
      TableName: this.tableName,
      IndexName: this.indexName,
      Limit: pageSize,
      ExclusiveStartKey:
        lastfollowerAlias === undefined
          ? undefined
          : {
              [this.followerAliasAttr]: lastfollowerAlias,
              [this.followeeAliasAttr]: followeeAlias,
            },
    };

    const items: FollowDto[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push({
        followerAlias: item[this.followerAliasAttr],
        followeeAlias: item[this.followeeAliasAttr],
      })
    );
    return { values: items, hasMorePages: hasMorePages };
  }
}
