import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface CountRequest extends TweeterRequest {
  readonly user: UserDto;
}
