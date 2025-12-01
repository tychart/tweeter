import { IsFollowerRequest, IsFollowerResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { FollowDaoDynamo } from "../../model/dao/dynamodb/FollowDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { FollowDaoFactory } from "../../model/dao/FollowDao";

export const handler = async (
  request: IsFollowerRequest
): Promise<IsFollowerResponse> => {
  const followDaoFactory: FollowDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
    followDao: new FollowDaoDynamo(),
  };

  const followService = new FollowService(followDaoFactory);

  const isFollower: boolean = await followService.getIsFollowerStatus(
    request.token,
    request.user,
    request.selectedUser
  );

  return {
    isFollower: isFollower,
    success: true,
    message: null,
  };
};
