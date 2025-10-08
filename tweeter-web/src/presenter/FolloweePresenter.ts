import { AuthToken, User, FakeData } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";

export interface FolloweeView {}

export class FolloweePresenter {
  private service: FollowService;
  private view: FolloweeView;

  public constructor(view: FolloweeView) {
    this.service = new FollowService();
    this.view = view;
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.findUserByAlias(alias);
  }
}
