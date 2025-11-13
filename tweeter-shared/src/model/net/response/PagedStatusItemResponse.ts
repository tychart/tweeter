import { StatusDto } from "../../dto/StatusDto";
import { PagedItemResponse } from "./PagedItemResponse";

export interface PagedStatusItemResponse extends PagedItemResponse {
  readonly items: StatusDto[] | null;
}
