import { AuthToken, User, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class FollowService implements Service {
  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);
    const serverFacade = new ServerFacade();

    return serverFacade.getMoreFollowees({
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: this.parseLastItem(lastItem),
    });
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);

    const serverFacade = new ServerFacade();

    return serverFacade.getMoreFollowers({
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: this.parseLastItem(lastItem),
    });
  }

  parseLastItem(lastItem: User | null): UserDto | null {
    if (lastItem === null) {
      return null;
    }

    return lastItem.dto;
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.getFolloweeCount(user.alias);

    const serverFacade = new ServerFacade();

    return serverFacade.getFolloweeCount({
      token: authToken.token,
      userAlias: user.alias,
      user: user.dto,
    });
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.getFollowerCount(user.alias);

    const serverFacade = new ServerFacade();

    return serverFacade.getFollowerCount({
      token: authToken.token,
      userAlias: user.alias,
      user: user.dto,
    });
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.isFollower();

    const serverFacade = new ServerFacade();

    const isFollower = serverFacade.getIsFollowerStatus({
      token: authToken.token,
      userAlias: user.alias,
      user: user.dto,
      selectedUser: selectedUser.dto,
    });

    // console.log(
    //   "This is the result of serverFacade.getIsFollowerStatus: ",
    //   isFollower
    // );

    return isFollower;
  }
}
