import { FollowChangeRequest, TweeterResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: FollowChangeRequest
): Promise<TweeterResponse> => {
  const followService = new FollowService();

  const followChangeSuccess: boolean = await followService.follow(
    request.token,
    request.user
  );

  return {
    success: followChangeSuccess,
    message: null,
  };
};
