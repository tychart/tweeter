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
  readonly followerNameAttr = "follower_name";
  readonly followeeAliasAttr = "followee_alias";
  readonly followeeNameAttr = "followee_name";

  public async putFollow(follow: FollowDto): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.followerAliasAttr]: follow.followerAlias,
        [this.followerNameAttr]: follow.followerName,
        [this.followeeAliasAttr]: follow.followeeAlias,
        [this.followeeNameAttr]: follow.followeeName,
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
        followerName: response.Item[this.followerNameAttr],
        followeeAlias: response.Item[this.followeeAliasAttr],
        followeeName: response.Item[this.followeeNameAttr],
      };
    }

    return undefined;
  }

  public async updateFollow(
    followerAlias: string,
    follower_name: string,
    followeeAlias: string,
    followee_name: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAliasAttr]: followerAlias,
        [this.followeeAliasAttr]: followeeAlias,
      },
      ExpressionAttributeValues: {
        ":follower_name": follower_name,
        ":followee_name": followee_name,
      },
      UpdateExpression:
        "SET " +
        this.followerNameAttr +
        " = :follower_name, " +
        this.followeeNameAttr +
        " = :followee_name",
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
        followerName: item[this.followerNameAttr],
        followeeAlias: item[this.followeeAliasAttr],
        followeeName: item[this.followeeNameAttr],
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
        followerName: item[this.followerNameAttr],
        followeeAlias: item[this.followeeAliasAttr],
        followeeName: item[this.followeeNameAttr],
      })
    );
    return { values: items, hasMorePages: hasMorePages };
  }
}
