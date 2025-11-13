import { UserDto } from "../../dto/UserDto";
import { TweeterResponse } from "./TweeterResponse";

export interface CountResponse extends TweeterResponse {
  readonly count: number;
}
