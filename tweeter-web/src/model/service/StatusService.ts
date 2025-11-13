import { AuthToken, Status, FakeData, StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class StatusService implements Service {
  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.getPageOfStatuses(lastItem, pageSize);

    console.log("LoadMoreFeedItems Last Item: ", lastItem);

    const serverFacade = new ServerFacade();

    return serverFacade.getMoreFeedItems({
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: this.parseLastItem(lastItem),
    });
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.getPageOfStatuses(lastItem, pageSize);

    const serverFacade = new ServerFacade();

    return serverFacade.getMoreStoryItems({
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: this.parseLastItem(lastItem),
    });
  }

  private parseLastItem(lastItem: Status | null): StatusDto | null {
    if (lastItem === null) {
      return null;
    }

    console.log(
      "Last item is not parsed as null, so this is native lastitem: ",
      lastItem
    );
    console.log(
      "Last item is not parsed as null, so this is DTO lastitem: ",
      lastItem.dto
    );

    return lastItem.dto;
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server to post the status
  }
}
