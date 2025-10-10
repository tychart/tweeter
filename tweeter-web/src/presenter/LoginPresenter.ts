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
  private _rememberMe: boolean = false;
  private _isLoading: boolean = false;

  public constructor(view: LoginView) {
    this.view = view;
    this.authService = new AuthService();
  }

  public get rememberMe(): boolean {
    return this._rememberMe;
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public set rememberMe(value: boolean) {
    this._rememberMe = value;
  }

  public setRememberMe(value: boolean) {
    this._rememberMe = value;
  }

  public set isLoading(value: boolean) {
    this._isLoading = value;
  }

  public async doLogin(alias: string, password: string) {
    try {
      this._isLoading = true;

      const [user, authToken] = await this.authService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, this._rememberMe);

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
