import { GetUserResponse } from "./GetUserResponse";

export interface LoginResponse extends GetUserResponse {
  readonly token: string | null;
  readonly tokenTimestamp: number | null;
}
