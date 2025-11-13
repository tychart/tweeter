import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { UserItemPresenter } from "./UserItemPresenter";
import { PAGE_SIZE, PagedItemView } from "./PagedItemPresenter";

export class FollowerPresenter extends UserItemPresenter {
  protected itemDescription(): string {
    return "load followers";
  }
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[User[], boolean]> {
    return this.service.loadMoreFollowers(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }
}
