import { UserDto } from "../../dto/UserDto";
import { AuthenticatedRequest } from "./AuthenticatedRequest";
import { TweeterRequest } from "./TweeterRequest";

export interface IsFollowerRequest extends AuthenticatedRequest {
  readonly userAlias: string;
  readonly user: UserDto;
  readonly selectedUser: UserDto;
}
