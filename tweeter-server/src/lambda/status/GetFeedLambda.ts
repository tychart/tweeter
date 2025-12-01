import {
  PagedStatusItemRequest,
  PagedStatusItemResponse,
} from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { StatusDaoFactory } from "../../model/dao/StatusDao";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { StatusDaoDynamo } from "../../model/dao/dynamodb/StatusDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { FeedDaoDynamo } from "../../model/dao/dynamodb/FeedDaoDynamo";
import { FollowDaoDynamo } from "../../model/dao/dynamodb/FollowDaoDynamo";

export const handler = async (
  request: PagedStatusItemRequest
): Promise<PagedStatusItemResponse> => {
  const statusDaoFactory: StatusDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
    followDao: new FollowDaoDynamo(),
    statusDao: new StatusDaoDynamo(),
    feedDao: new FeedDaoDynamo(),
  };

  const statusService = new StatusService(statusDaoFactory);

  const [items, hasMore] = await statusService.loadMoreFeedItems(
    request.token,
    request.userAlias,
    request.pageSize,
    request.lastItem
  );

  return {
    success: true,
    message: null,
    items: items,
    hasMore: hasMore,
  };
};
