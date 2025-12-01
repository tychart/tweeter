// tweeter-shared/src/dao/FollowDao.ts

import { AuthToken, UserDto } from "tweeter-shared";
import { AuthDao } from "./AuthDao";

export interface StatusDaoFactory {
  authDao: AuthDao;
  statusDao: StatusDao;
}

export interface StatusDao {
  putPost(alias: string, timestamp: number, post: string): Promise<boolean>;

  getPost(
    token: string,
    timestamp: number
  ): Promise<{ alias: string; timestamp: number; post: string } | undefined>;

  // validateAuth(token: string): Promise<[AuthToken, string]>;

  // deleteAuth(token: string): Promise<void>;
}
