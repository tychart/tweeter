import {
  AuthenticatedRequest,
  AuthToken,
  CountRequest,
  CountResponse,
  FollowChangeRequest,
  GetUserRequest,
  GetUserResponse,
  IsFollowerRequest,
  IsFollowerResponse,
  LoginRequest,
  LoginResponse,
  PagedStatusItemRequest,
  PagedStatusItemResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  PostStatusRequest,
  RegisterRequest,
  Status,
  StatusDto,
  TweeterResponse,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";
import { PrimaryExpression } from "typescript";

export class ServerFacade {
  private SERVER_URL =
    "https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/followee/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    return this.userDtoResToUserArr(response, "No followees found");
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follower/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    return this.userDtoResToUserArr(response, "No followers found");
  }

  public async getMoreFeedItems(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/feed/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    return this.statusDtoResToStatusArr(response, "No feed items found");
  }

  public async getMoreStoryItems(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/story/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    return this.statusDtoResToStatusArr(response, "No story items found");
  }

  // Convert the UserDto array returned by ClientCommunicator to a User array
  private userDtoResToUserArr(
    response: PagedUserItemResponse,
    errorMsg: string
  ): [User[], boolean] {
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto: UserDto) => User.fromDto(dto) as User)
        : null;

    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(errorMsg);
      } else {
        // console.log(
        //   `This is the value of response.hasMore: ${response.hasMore}`
        // );
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  // Convert the StatusDto array returned by ClientCommunicator to a Status array
  private statusDtoResToStatusArr(
    response: PagedStatusItemResponse,
    errorMsg: string
  ): [Status[], boolean] {
    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto: StatusDto) => Status.fromDto(dto) as Status)
        : null;

    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(errorMsg);
      } else {
        // console.log("This is the value of response: ", response);
        // console.log("These are the items after conversion");
        // console.log(items);
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async postStatus(request: PostStatusRequest): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      PostStatusRequest,
      TweeterResponse
    >(request, "/user/post");

    this.handleErrors(response);

    return response.success;
  }

  public async getFolloweeCount(request: CountRequest): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      CountRequest,
      CountResponse
    >(request, "/followee/count");

    this.handleErrors(response);

    return response.count;
  }

  public async getFollowerCount(request: CountRequest): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      CountRequest,
      CountResponse
    >(request, "/follower/count");

    this.handleErrors(response);

    return response.count;
  }

  public async getIsFollowerStatus(
    request: IsFollowerRequest
  ): Promise<boolean> {
    // console.log(
    //   "This is the request from serverFacade.getIsFollowerStatus: ",
    //   request
    // );

    const response = await this.clientCommunicator.doPost<
      IsFollowerRequest,
      IsFollowerResponse
    >(request, "/follower/status");

    // console.log(
    //   "This is the response from serverFacade.getIsFollowerStatus: ",
    //   response
    // );

    this.handleErrors(response);

    return response.isFollower;
  }

  public async getUser(request: GetUserRequest): Promise<User | null> {
    const response = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(request, "/user/get");

    this.handleErrors(response);

    if (response.user === null) {
      return null;
    }

    return User.fromDto(response.user);
  }

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginRequest,
      LoginResponse
    >(request, "/user/login");

    this.handleErrors(response);

    if (
      response.user === null ||
      response.token === null ||
      response.tokenTimestamp === null
    ) {
      throw new Error("Invalid alias or password");
    }

    return [
      User.fromDto(response.user)!,
      new AuthToken(response.token, response.tokenTimestamp),
    ];
  }

  public async register(request: RegisterRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      RegisterRequest,
      LoginResponse
    >(request, "/user/register");

    this.handleErrors(response);

    if (
      response.user === null ||
      response.token === null ||
      response.tokenTimestamp === null
    ) {
      throw new Error(
        "There was an error where the recently registered user or recently generated authtoken were null"
      );
    }

    return [
      User.fromDto(response.user)!,
      new AuthToken(response.token, response.tokenTimestamp),
    ];
  }

  public async logout(request: AuthenticatedRequest): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      AuthenticatedRequest,
      TweeterResponse
    >(request, "/user/logout");

    this.handleErrors(response);

    return response.success;
  }

  public async follow(request: FollowChangeRequest): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      FollowChangeRequest,
      TweeterResponse
    >(request, "/follow/follow");

    this.handleErrors(response);

    return response.success;
  }

  public async unfollow(request: FollowChangeRequest): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      FollowChangeRequest,
      TweeterResponse
    >(request, "/follow/unfollow");

    this.handleErrors(response);

    return response.success;
  }

  private handleErrors(response: any) {
    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
}
