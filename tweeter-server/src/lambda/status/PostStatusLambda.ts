import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { StatusDaoDynamo } from "../../model/dao/dynamodb/StatusDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { StatusDaoFactory } from "../../model/dao/StatusDao";

export const handler = async (
  request: PostStatusRequest
): Promise<TweeterResponse> => {
  const statusDaoFactory: StatusDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
    statusDao: new StatusDaoDynamo(),
  };

  const statusService = new StatusService(statusDaoFactory);

  const posted = await statusService.postStatus(request.token, request.status);

  return {
    success: posted,
    message: null,
  };
};
