import { AuthToken, Status, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface StatusItemView {
  displayErrorMessage: (message: string) => void;
  addItems: (items: Status[]) => void;
}

export abstract class StatusItemPresenter {
  protected view: StatusItemView;
  protected userService: UserService;
  private _lastItem: Status | null = null;
  private _hasMoreItems = true;

  public constructor(view: StatusItemView) {
    this.view = view;
    this.userService = new UserService();
  }

  protected get lastItem() {
    return this._lastItem;
  }

  protected set lastItem(value: Status | null) {
    this._lastItem = value;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  public get hasMoreItems() {
    return this._hasMoreItems;
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }

  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
}
