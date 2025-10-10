import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";

export interface UserNavigationView {
  displayErrorMessage: (message: string) => string;
  setDisplayedUser: (user: User) => void;
  navigate: NavigateFunction;
  featurePath: string;
}

export class UserNavigationPresenter {
  private view: UserNavigationView;
  private userService: UserService = new UserService();

  public constructor(view: UserNavigationView) {
    this.view = view;
  }

  public async navigateToUser(
    event: React.MouseEvent,
    displayedUser: User | null,
    authToken: AuthToken | null
  ): Promise<void> {
    try {
      const alias = this.extractAlias(event.target.toString());

      const toUser = await this.userService.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${this.view.featurePath}/${toUser.alias}`);
        }
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`
      );
    }
  }

  public extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
