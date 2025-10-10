import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface StatusItemView {
  displayErrorMessage: (message: string) => void;
}

export class StatusItemPresenter {
  private view: StatusItemView;
  private userService: UserService;

  public constructor(view: StatusItemView) {
    this.view = view;
    this.userService = new UserService();
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }
}
