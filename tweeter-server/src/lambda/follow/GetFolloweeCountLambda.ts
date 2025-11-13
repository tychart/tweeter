import { CountRequest, CountResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: CountRequest
): Promise<CountResponse> => {
  const followService = new FollowService();

  const count: number = await followService.getFolloweeCount(
    request.token,
    request.user
  );

  return {
    count: count,
    success: true,
    message: null,
  };
};
