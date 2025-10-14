import { User } from "tweeter-shared";
import { PagedItemPresenter } from "./PagedItemPresenter";
import { FollowService } from "../model.service/FollowService";

// export interface UserItemView extends View {
//   addItems: (items: User[]) => void;
// }

export abstract class UserItemPresenter extends PagedItemPresenter<
  User,
  FollowService
> {
  protected serviceFactory(): FollowService {
    return new FollowService();
  }
}
