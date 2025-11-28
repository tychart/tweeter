import {
  AuthToken,
  User,
  FakeData,
  UserDto,
  FollowDto,
  DataPageDto,
} from "tweeter-shared";
import { Service } from "./Service";
import { FollowDaoDynamo } from "../dao/dynamodb/FollowDaoDynamo";
import { UserDaoDynamo } from "../dao/dynamodb/UserDaoDynamo";

export class FollowService implements Service {
  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // TODO: Replace with the result of calling server
    // return this.getFakeData(lastItem, pageSize, userAlias);

    const followDao = new FollowDaoDynamo();
    const userDao = new UserDaoDynamo();

    const dataPage: DataPageDto<FollowDto> = await followDao.getPageOfFollowees(
      pageSize,
      userAlias,
      lastItem?.alias
    );

    const users: UserDto[] = [];

    for (const item of dataPage.values) {
      const userDto = await userDao.getUser(item.followeeAlias);

      if (userDto !== undefined) {
        users.push(userDto);
      } else {
        console.log("Could not find a user with alias of ", item.followerAlias);
      }
    }

    // Need to query the users in order to properly return a list of UserDTOs
    return [users, dataPage.hasMorePages];
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // TODO: Replace with the result of calling server
    // return this.getFakeData(lastItem, pageSize, userAlias);

    const followDao = new FollowDaoDynamo();
    const userDao = new UserDaoDynamo();

    // console.log(
    //   "loadMoreFollowers Was Called trying to retrieve followers of user: ",
    //   userAlias
    // );

    const dataPage: DataPageDto<FollowDto> = await followDao.getPageOfFollowers(
      pageSize,
      userAlias,
      lastItem?.alias
    );

    // console.log(
    //   "These were the users found that follow the afformentioned user: ",
    //   dataPage.values
    // );

    const users: UserDto[] = [];

    for (const item of dataPage.values) {
      const userDto = await userDao.getUser(item.followerAlias);

      if (userDto !== undefined) {
        users.push(userDto);
      } else {
        console.log("Could not find a user with alias of ", item.followerAlias);
      }
    }

    // console.log(
    //   "These were the users returned from querying the user table to get all their info: ",
    //   users
    // );

    // Need to query the users in order to properly return a list of UserDTOs
    return [users, dataPage.hasMorePages];
  }

  private async getFakeData(
    lastItem: any,
    pageSize: number,
    userAlias: string
  ): Promise<[UserDto[], boolean]> {
    const [items, hasMore] = FakeData.instance.getPageOfUsers(
      User.fromDto(lastItem),
      pageSize,
      userAlias
    );

    const dtos = items.map((user) => user.dto);

    return [dtos, hasMore];
  }

  // private createDto(user: User): UserDto {
  //   return {
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     alias: user.alias,
  //     imageUrl: user.imageUrl,
  //   };
  // }

  // private getDomainObject(dto: UserDto | null): User | null {
  //   return dto == null
  //     ? null
  //     : new User(dto.firstName, dto.lastName, dto.alias, dto.imageUrl);
  // }

  public async getFolloweeCount(token: string, user: UserDto): Promise<number> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(token: string, user: UserDto): Promise<number> {
    // TODO: Replace with the result of calling server

    return FakeData.instance.getFollowerCount(user.alias);
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    console.log("User: ", user);
    console.log("Selected User: ", user);

    // TODO: Replace with the result of calling server
    // return FakeData.instance.isFollower();

    const followDao = new FollowDaoDynamo();

    const followItem: FollowDto | undefined = await followDao.getFollow(
      user.alias,
      selectedUser.alias
    );

    console.log("FollowItem retrieved from database: ", followItem);

    if (followItem === undefined) {
      return false;
    } else {
      return true;
    }
  }

  public async follow(token: string, userToFollow: UserDto): Promise<boolean> {
    // Pause so we can see the follow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    return true;
  }

  public async unfollow(
    token: string,
    userToUnfollow: UserDto
  ): Promise<boolean> {
    // Pause so we can see the unfollow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    return true;
  }
}
