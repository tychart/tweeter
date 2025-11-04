import { AuthToken, User, FakeData, UserDto } from "tweeter-shared";
import { Service } from "./Service";

export class FollowService implements Service {
  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return this.getFakeData(lastItem, pageSize, userAlias);
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return this.getFakeData(lastItem, pageSize, userAlias);
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
}
