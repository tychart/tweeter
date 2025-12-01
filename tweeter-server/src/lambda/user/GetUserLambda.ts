import { GetUserRequest, GetUserResponse, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { UserDaoFactory } from "../../model/dao/UserDao";

export const handler = async (
  request: GetUserRequest
): Promise<GetUserResponse> => {
  const userDaoFactory: UserDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
  };

  const userService = new UserService(userDaoFactory);

  const retrievedUser: UserDto | null = await userService.getUser(
    request.token,
    request.userAlias
  );

  if (retrievedUser === null) {
    return {
      success: false,
      message: "Did not find the requested user",
      user: retrievedUser,
    };
  }

  return {
    success: true,
    message: null,
    user: retrievedUser,
  };
};
