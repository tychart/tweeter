import { GetUserRequest, GetUserResponse, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: GetUserRequest
): Promise<GetUserResponse> => {
  const userService = new UserService();

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
