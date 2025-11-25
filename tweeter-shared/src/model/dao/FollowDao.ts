// tweeter-shared/src/dao/FollowDao.ts
import { UserDto } from "../dto/UserDto";

export interface FollowDao {
  /** Return all followees of a user (paged). */
  getFollowees(
    userAlias: string,
    limit: number,
    lastKey?: string
  ): Promise<{ items: UserDto[]; lastKey?: string }>;

  /** Return all followers of a user (paged). */
  getFollowers(
    userAlias: string,
    limit: number,
    lastKey?: string
  ): Promise<{ items: UserDto[]; lastKey?: string }>;

  /** Count how many users a user is following. */
  countFollowees(userAlias: string): Promise<number>;

  /** Count how many users are following a user. */
  countFollowers(userAlias: string): Promise<number>;

  /** Is *userAlias* following *followeeAlias*? */
  isFollowing(userAlias: string, followeeAlias: string): Promise<boolean>;

  /** Make *userAlias* follow *followeeAlias*. */
  addFollow(userAlias: string, followeeAlias: string): Promise<void>;

  /** Remove a follow relationship. */
  removeFollow(userAlias: string, followeeAlias: string): Promise<void>;
}
