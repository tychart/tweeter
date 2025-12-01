// tweeter-shared/src/dao/FollowDao.ts

import { AuthToken, UserDto } from "tweeter-shared";

export interface AuthDao {
  putAuth(authToken: AuthToken, alias: string): Promise<boolean>;

  getAuth(token: string): Promise<[AuthToken, string] | undefined>;

  validateAuth(token: string): Promise<[AuthToken, string]>;

  deleteAuth(token: string): Promise<void>;
}
