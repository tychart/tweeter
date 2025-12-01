// tweeter-shared/src/dao/FollowDao.ts

import {
  AuthToken,
  DataPageDto,
  SmallStatusDto,
  StatusDto,
  UserDto,
} from "tweeter-shared";
import { AuthDao } from "./AuthDao";
import { FollowDao } from "./FollowDao";
import { StatusDao } from "./StatusDao";
import { UserDao } from "./UserDao";

export interface FeedDaoFactory {
  authDao: AuthDao;
  userDao: UserDao;
  followDao: FollowDao;
  statusDao: StatusDao;
  feedDao: FeedDao;
}

export interface FeedDao {
  putPost(
    alias: string,
    timestamp: number,
    authorAlias: string,
    post: string
  ): Promise<boolean>;

  getPost(
    token: string,
    timestamp: number
  ): Promise<[SmallStatusDto, string] | undefined>;

  getPageOfFeed(
    pageSize: number,
    alias: string,
    lastTimestamp?: number | undefined
  ): Promise<DataPageDto<SmallStatusDto>>;

  // deleteAuth(token: string): Promise<void>;
}
