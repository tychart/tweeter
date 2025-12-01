// tweeter-shared/src/dao/FollowDao.ts

import {
  AuthToken,
  DataPageDto,
  SmallStatusDto,
  UserDto,
} from "tweeter-shared";
import { AuthDao } from "./AuthDao";
import { UserDao } from "./UserDao";
import { FollowDao } from "./FollowDao";
import { FeedDao } from "./FeedDao";

export interface StatusDaoFactory {
  authDao: AuthDao;
  userDao: UserDao;
  followDao: FollowDao;
  statusDao: StatusDao;
  feedDao: FeedDao;
}

export interface StatusDao {
  putPost(alias: string, timestamp: number, post: string): Promise<boolean>;

  getPost(
    token: string,
    timestamp: number
  ): Promise<{ alias: string; timestamp: number; post: string } | undefined>;

  getPageOfStory(
    pageSize: number,
    alias: string,
    lastTimestamp?: number | undefined
  ): Promise<DataPageDto<SmallStatusDto>>;

  // validateAuth(token: string): Promise<[AuthToken, string]>;

  // deleteAuth(token: string): Promise<void>;
}
