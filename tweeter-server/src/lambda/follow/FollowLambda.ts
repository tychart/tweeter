import { FollowChangeRequest, TweeterResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { FollowDaoDynamo } from "../../model/dao/dynamodb/FollowDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { FollowDaoFactory } from "../../model/dao/FollowDao";

export const handler = async (
  request: FollowChangeRequest
): Promise<TweeterResponse> => {
  const followDaoFactory: FollowDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
    followDao: new FollowDaoDynamo(),
  };

  const followService = new FollowService(followDaoFactory);

  const followChangeSuccess: boolean = await followService.follow(
    request.token,
    request.user.alias
  );

  return {
    success: followChangeSuccess,
    message: null,
  };
};
