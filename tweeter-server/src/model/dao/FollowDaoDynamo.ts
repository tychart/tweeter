import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DataPageDto, FollowDto, FollowDao, Follow } from "tweeter-shared";

export class FollowDaoDynamo implements FollowDao {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  readonly tableName = "follows";
  readonly indexName = "follows_index";

  readonly followerHandleAttr = "follower_handle";
  readonly followerNameAttr = "follower_name";
  readonly followeeHandleAttr = "followee_handle";
  readonly followeeNameAttr = "followee_name";

  public async putFollow(follow: Follow): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.followerHandleAttr]: follow.follower.alias,
        [this.followerNameAttr]: follow.follower.name,
        [this.followeeHandleAttr]: follow.followee.alias,
        [this.followeeNameAttr]: follow.followee.name,
      },
    };
    await this.client.send(new PutCommand(params));

    return true;
  }

  public async getFollow(
    followerHandle: string,
    followeeHandle: string
  ): Promise<FollowDto | undefined> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerHandleAttr]: followerHandle,
        [this.followeeHandleAttr]: followeeHandle,
      },
    };
    const response = await this.client.send(new GetCommand(params));

    if (response.Item) {
      return {
        followerHandle: response.Item[this.followerHandleAttr],
        followerName: response.Item[this.followerNameAttr],
        followeeHandle: response.Item[this.followeeHandleAttr],
        followeeName: response.Item[this.followeeNameAttr],
      };
    }

    return undefined;
  }

  public async updateFollow(
    followerHandle: string,
    follower_name: string,
    followeeHandle: string,
    followee_name: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerHandleAttr]: followerHandle,
        [this.followeeHandleAttr]: followeeHandle,
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
    followerHandle: string,
    followeeHandle: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerHandleAttr]: followerHandle,
        [this.followeeHandleAttr]: followeeHandle,
      },
    };
    await this.client.send(new DeleteCommand(params));
  }

  async getPageOfFollowees(
    pageSize: number,
    followerHandle: string,
    followeeHandle?: string | undefined
  ): Promise<DataPageDto<FollowDto>> {
    const params = {
      KeyConditionExpression: this.followerHandleAttr + " = :v",
      ExpressionAttributeValues: {
        ":v": followerHandle,
      },
      TableName: this.tableName,
      Limit: pageSize,
      ExclusiveStartKey:
        followeeHandle === undefined
          ? undefined
          : {
              [this.followerHandleAttr]: followerHandle,
              [this.followeeHandleAttr]: followeeHandle,
            },
    };

    const items: FollowDto[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push({
        followerHandle: item[this.followerHandleAttr],
        followerName: item[this.followerNameAttr],
        followeeHandle: item[this.followeeHandleAttr],
        followeeName: item[this.followeeNameAttr],
      })
    );
    return { values: items, hasMorePages: hasMorePages };
  }

  async getPageOfFollowers(
    pageSize: number,
    followeeHandle: string,
    lastFollowerHandle?: string | undefined
  ): Promise<DataPageDto<FollowDto>> {
    const params = {
      KeyConditionExpression: this.followeeHandleAttr + " = :v",
      ExpressionAttributeValues: {
        ":v": followeeHandle,
      },
      TableName: this.tableName,
      IndexName: this.indexName,
      Limit: pageSize,
      ExclusiveStartKey:
        lastFollowerHandle === undefined
          ? undefined
          : {
              [this.followerHandleAttr]: lastFollowerHandle,
              [this.followeeHandleAttr]: followeeHandle,
            },
    };

    const items: FollowDto[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push({
        followerHandle: item[this.followerHandleAttr],
        followerName: item[this.followerNameAttr],
        followeeHandle: item[this.followeeHandleAttr],
        followeeName: item[this.followeeNameAttr],
      })
    );
    return { values: items, hasMorePages: hasMorePages };
  }
}
