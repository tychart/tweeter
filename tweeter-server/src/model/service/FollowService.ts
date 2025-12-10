import {
  AuthToken,
  User,
  FakeData,
  UserDto,
  FollowDto,
  DataPageDto,
} from "tweeter-shared";
import { Service } from "./Service";
import { AuthDao } from "../dao/AuthDao";
import { FollowDao, FollowDaoFactory } from "../dao/FollowDao";
import { UserDao } from "../dao/UserDao";

export class FollowService implements Service {
  private authDao: AuthDao;
  private userDao: UserDao;
  private followDao: FollowDao;

  constructor(followDaoFactory: FollowDaoFactory) {
    this.authDao = followDaoFactory.authDao;
    this.userDao = followDaoFactory.userDao;
    this.followDao = followDaoFactory.followDao;
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authDao.validateAuth(token);

    const dataPage: DataPageDto<FollowDto> =
      await this.followDao.getPageOfFollowees(
        pageSize,
        userAlias,
        lastItem?.alias
      );

    const users: UserDto[] = [];

    for (const item of dataPage.values) {
      const userDto = await this.userDao.getUser(item.followeeAlias);

      if (userDto !== undefined) {
        users.push(userDto);
      } else {
        console.log("Could not find a user with alias of ", item.followerAlias);
      }
    }

    return [users, dataPage.hasMorePages];
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authDao.validateAuth(token);

    const dataPage: DataPageDto<FollowDto> =
      await this.followDao.getPageOfFollowers(
        pageSize,
        userAlias,
        lastItem?.alias
      );

    const users: UserDto[] = [];

    for (const item of dataPage.values) {
      const userDto = await this.userDao.getUser(item.followerAlias);

      if (userDto !== undefined) {
        users.push(userDto);
      } else {
        console.log("Could not find a user with alias of ", item.followerAlias);
      }
    }

    return [users, dataPage.hasMorePages];
  }

  public async getFolloweeCount(
    token: string,
    userAlias: string
  ): Promise<number> {
    await this.authDao.validateAuth(token);

    const fullUser = await this.userDao.getFullUser(userAlias);

    if (fullUser === undefined) {
      throw new Error(
        `Error: bad-request - The followee count requested for user ${userAlias} was not found in the database, something might be wrong with the record`
      );
    }

    return fullUser.followeeCount;
  }

  public async getFollowerCount(
    token: string,
    userAlias: string
  ): Promise<number> {
    await this.authDao.validateAuth(token);

    const fullUser = await this.userDao.getFullUser(userAlias);

    if (fullUser === undefined) {
      throw new Error(
        `Error: bad-request - The followee count requested for user ${userAlias} was not found in the database, something might be wrong with the record`
      );
    }

    return fullUser.followerCount;
  }

  public async getIsFollowerStatus(
    token: string,
    userAlias: string,
    selectedUserAlias: string
  ): Promise<boolean> {
    // console.log("userAlias: ", userAlias);
    // console.log("selectedUserAlias: ", selectedUserAlias);

    await this.authDao.validateAuth(token);

    const followItem: FollowDto | undefined = await this.followDao.getFollow(
      userAlias,
      selectedUserAlias
    );

    // console.log("FollowItem retrieved from database: ", followItem);

    if (followItem === undefined) {
      return false;
    } else {
      return true;
    }
  }

  public async follow(token: string, aliasToFollow: string): Promise<boolean> {
    // console.log("Input Token: ", token);
    // console.log("Input User Alias To Follow: ", aliasToFollow);

    const auth = await this.authDao.validateAuth(token);
    const [authToken, alias] = auth;

    // console.log("Retrieved Token From Authtable: ", authToken);
    // console.log("Retrieved alias From Authtable: ", alias);

    if (await this.getIsFollowerStatus(token, alias, aliasToFollow)) {
      return false;
    }
    ///////// RIGHT HERE ///////////
    // Ask about how to manage the async properly so that these database commands can be run parellel to one another instead of having to wait for each one to finish one right after the other.
    await this.followDao.putFollow({
      followeeAlias: aliasToFollow,
      followerAlias: alias,
    });

    await this.userDao.updateFolloweeCount(alias, 1);
    await this.userDao.updateFollowerCount(aliasToFollow, 1);

    return true;
  }

  public async unfollow(
    token: string,
    aliasToUnfollow: string
  ): Promise<boolean> {
    const auth = await this.authDao.validateAuth(token);
    const [authToken, alias] = auth;

    console.log("Retrieved Token From Authtable: ", authToken);
    console.log("Retrieved Alias From Authtable: ", alias);

    if (!(await this.getIsFollowerStatus(token, alias, aliasToUnfollow))) {
      return false;
    }

    await this.followDao.deleteFollow({
      followeeAlias: aliasToUnfollow,
      followerAlias: alias,
    });

    await this.userDao.updateFolloweeCount(alias, -1);
    await this.userDao.updateFollowerCount(aliasToUnfollow, -1);

    return true;
  }
}
