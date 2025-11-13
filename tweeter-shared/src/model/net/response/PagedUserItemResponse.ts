import { UserDto } from "../../dto/UserDto";
import { PagedItemResponse } from "./PagedItemResponse";

export interface PagedUserItemResponse extends PagedItemResponse {
  readonly items: UserDto[] | null;
}
