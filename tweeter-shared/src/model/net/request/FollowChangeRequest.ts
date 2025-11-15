import { UserDto } from "../../dto/UserDto";
import { AuthenticatedRequest } from "./AuthenticatedRequest";

export interface FollowChangeRequest extends AuthenticatedRequest {
  readonly user: UserDto;
}
