// tweeter-shared/src/dao/FollowDao.ts

import { FollowDto, DataPageDto } from "tweeter-shared";

export interface FollowDao {
  // /** Count how many users a user is following. */
  // countFollowees(userAlias: string): Promise<number>;

  // /** Count how many users are following a user. */
  // countFollowers(userAlias: string): Promise<number>;

  updateFollow(
    followerHandle: string,
    follower_name: string,
    followeeHandle: string,
    followee_name: string
  ): Promise<void>;

  // /** Is *userAlias* following *followeeAlias*? */
  // isFollowing(userAlias: string, followeeAlias: string): Promise<boolean>;

  putFollow(follow: FollowDto): Promise<boolean>;

  getFollow(
    followerHandle: string,
    followeeHandle: string
  ): Promise<FollowDto | undefined>;

  deleteFollow(follow: FollowDto): Promise<boolean>;

  /** Return all followees of a user (paged). */
  getPageOfFollowees(
    pageSize: number,
    followerHandle: string,
    followeeHandle?: string | undefined
  ): Promise<DataPageDto<FollowDto>>;

  /** Return all followers of a user (paged). */
  getPageOfFollowers(
    pageSize: number,
    followeeHandle: string,
    lastFollowerHandle?: string | undefined
  ): Promise<DataPageDto<FollowDto>>;
}
