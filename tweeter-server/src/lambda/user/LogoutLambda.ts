import { AuthenticatedRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: AuthenticatedRequest
): Promise<TweeterResponse> => {
  const userService = new UserService();

  const loggedOut: boolean = await userService.logout(request.token);

  return {
    success: loggedOut,
    message: null,
  };
};
