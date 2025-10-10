import { User, AuthToken } from "tweeter-shared";
import { AuthService } from "../model.service/AuthService";

export interface LoginView {
  displayErrorMessage: (message: string) => string;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (...args: any[]) => void;
  originalUrl: string | undefined;
}

export class LoginPresenter {
  private view: LoginView;
  private authService: AuthService;
  private _isLoading: boolean = false;

  public constructor(view: LoginView) {
    this.view = view;
    this.authService = new AuthService();
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public set isLoading(value: boolean) {
    this._isLoading = value;
  }

  public async doLogin(alias: string, password: string, rememberMe: boolean) {
    try {
      this._isLoading = true;

      const [user, authToken] = await this.authService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!this.view.originalUrl) {
        this.view.navigate(this.view.originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`
      );
    } finally {
      this._isLoading = false;
    }
  }
}
