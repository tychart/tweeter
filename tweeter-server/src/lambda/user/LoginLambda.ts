import {
  AuthToken,
  LoginRequest,
  LoginResponse,
  UserDto,
} from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { UserDaoFactory } from "../../model/dao/UserDao";

export const handler = async (
  request: LoginRequest
): Promise<LoginResponse> => {
  const userDaoFactory: UserDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
  };

  const userService = new UserService(userDaoFactory);

  const [retrievedUser, authToken]: [UserDto | null, AuthToken | null] =
    await userService.login(request.userAlias, request.password);

  if (retrievedUser === null || authToken === null) {
    return {
      success: false,
      message: "Invalid alias or password",
      user: retrievedUser,
      token: null,
      tokenTimestamp: null,
    };
  }

  return {
    success: true,
    message: null,
    user: retrievedUser,
    token: authToken.token,
    tokenTimestamp: authToken.timestamp,
  };
};
