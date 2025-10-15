import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";
import { Presenter, View } from "./Presenter";

export interface UserNavigationView extends View {
  setDisplayedUser: (user: User) => void;
  navigate: NavigateFunction;
  featurePath: string;
}

export class UserNavigationPresenter extends Presenter<UserNavigationView> {
  private userService: UserService = new UserService();

  public constructor(view: UserNavigationView) {
    super(view);
  }

  public async navigateToUser(
    event: React.MouseEvent,
    displayedUser: User | null,
    authToken: AuthToken | null
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(event.target.toString());

      const toUser = await this.userService.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${this.view.featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }

  public extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
