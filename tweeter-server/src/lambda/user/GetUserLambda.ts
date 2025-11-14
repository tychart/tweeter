import { GetUserRequest, GetUserResponse, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: GetUserRequest
): Promise<GetUserResponse> => {
  const userService = new UserService();
  let found: boolean = true;

  const retrievedUser: UserDto | null = await userService.getUser(
    request.token,
    request.userAlias
  );

  if (retrievedUser === null) {
    found = false;
  }

  return {
    success: found,
    message: null,
    user: retrievedUser,
  };
};
