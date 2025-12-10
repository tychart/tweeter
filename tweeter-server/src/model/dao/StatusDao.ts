// tweeter-shared/src/dao/FollowDao.ts

import {
  AuthToken,
  DataPageDto,
  SmallStatusDto,
  UserDto,
} from "tweeter-shared";
import { AuthDao } from "./AuthDao";
import { UserDao } from "./UserDao";
import { FeedDao } from "./FeedDao";
import { QueueDao } from "./QueueDao";
import { FollowDao } from "./FollowDao";

export interface StatusDaoFactory {
  authDao: AuthDao;
  userDao: UserDao;
  followDao: FollowDao;
  statusDao: StatusDao;
  feedDao: FeedDao;
  queueDao: QueueDao;
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
