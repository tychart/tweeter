import {
  PagedStatusItemRequest,
  PagedStatusItemResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  Status,
  StatusDto,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

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
        console.log(
          `This is the value of response.hasMore: ${response.hasMore}`
        );
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
        console.log("This is the value of response: ", response);
        console.log("These are the items after conversion");
        console.log(items);
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
}
