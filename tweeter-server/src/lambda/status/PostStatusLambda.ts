import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";

export const handler = async (
  request: PostStatusRequest
): Promise<TweeterResponse> => {
  const statusService = new StatusService();

  const posted = await statusService.postStatus(
    request.token,
    request.userAlias,
    request.status
  );

  return {
    success: posted,
    message: null,
  };
};
