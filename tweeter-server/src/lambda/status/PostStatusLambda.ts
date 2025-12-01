import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { StatusDaoDynamo } from "../../model/dao/dynamodb/StatusDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { StatusDaoFactory } from "../../model/dao/StatusDao";
import { FeedDaoDynamo } from "../../model/dao/dynamodb/FeedDaoDynamo";
import { Follow } from "tweeter-shared";
import { FollowDaoDynamo } from "../../model/dao/dynamodb/FollowDaoDynamo";

export const handler = async (
  request: PostStatusRequest
): Promise<TweeterResponse> => {
  const statusDaoFactory: StatusDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
    followDao: new FollowDaoDynamo(),
    statusDao: new StatusDaoDynamo(),
    feedDao: new FeedDaoDynamo(),
  };

  const statusService = new StatusService(statusDaoFactory);

  const posted = await statusService.postStatus(request.token, request.status);

  return {
    success: posted,
    message: null,
  };
};
