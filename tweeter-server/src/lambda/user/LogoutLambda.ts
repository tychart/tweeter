import { AuthenticatedRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { UserDaoFactory } from "../../model/dao/UserDao";

export const handler = async (
  request: AuthenticatedRequest
): Promise<TweeterResponse> => {
  const userDaoFactory: UserDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
  };

  const userService = new UserService(userDaoFactory);

  const loggedOut: boolean = await userService.logout(request.token);

  return {
    success: loggedOut,
    message: null,
  };
};
