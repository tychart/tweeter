// tweeter-shared/src/dao/FollowDao.ts

import { UserDto } from "tweeter-shared";

export interface UserDao {
  putUser(follow: UserDto, password_hash: string): Promise<boolean>;

  getUser(alias: string): Promise<UserDto | undefined>;

  getFullUser(alias: string): Promise<
    | {
        userDto: UserDto;
        passHash: string;
        followeeCount: number;
        followerCount: number;
      }
    | undefined
  >;

  // updateFollow(
  //   followerHandle: string,
  //   follower_name: string,
  //   followeeHandle: string,
  //   followee_name: string
  // ): Promise<boolean>;

  // deleteFollow(followerHandle: string, followeeHandle: string): Promise<void>;

  // /** Return all followees of a user (paged). */
  // getPageOfFollowees(
  //   pageSize: number,
  //   followerHandle: string,
  //   followeeHandle?: string | undefined
  // ): Promise<DataPageDto<FollowDto>>;

  // /** Return all followers of a user (paged). */
  // getPageOfFollowers(
  //   pageSize: number,
  //   followeeHandle: string,
  //   lastFollowerHandle?: string | undefined
  // ): Promise<DataPageDto<FollowDto>>;
}
