import { TweeterRequest } from "./TweeterRequest";

export interface LoginRequest extends TweeterRequest {
  readonly userAlias: string;
  readonly password: string;
}
