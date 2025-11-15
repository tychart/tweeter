import {
  AuthToken,
  LoginRequest,
  LoginResponse,
  UserDto,
} from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: LoginRequest
): Promise<LoginResponse> => {
  const userService = new UserService();

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
