import { CountRequest, CountResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { FollowDaoDynamo } from "../../model/dao/dynamodb/FollowDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { FollowDaoFactory } from "../../model/dao/FollowDao";

export const handler = async (
  request: CountRequest
): Promise<CountResponse> => {
  const followDaoFactory: FollowDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
    followDao: new FollowDaoDynamo(),
  };

  const followService = new FollowService(followDaoFactory);

  const count: number = await followService.getFollowerCount(
    request.token,
    request.user
  );

  return {
    count: count,
    success: true,
    message: null,
  };
};
