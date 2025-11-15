import {
  AuthToken,
  RegisterRequest,
  LoginResponse,
  UserDto,
} from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: RegisterRequest
): Promise<LoginResponse> => {
  const userService = new UserService();

  const [retrievedUser, authToken]: [UserDto | null, AuthToken | null] =
    await userService.register(
      request.firstName,
      request.lastName,
      request.userAlias,
      request.password,
      request.imageStringBase64,
      request.imageFileExtension
    );

  if (retrievedUser === null || authToken === null) {
    return {
      success: false,
      message:
        "There was a server error where the recently registered user or recently generated authtoken were null",
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
