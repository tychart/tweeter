import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface PagedItemRequest extends TweeterRequest {
  readonly pageSize: number;
}
