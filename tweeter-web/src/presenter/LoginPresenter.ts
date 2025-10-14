import { User, AuthToken } from "tweeter-shared";
import { AuthService } from "../model.service/AuthService";
import { Presenter, View } from "./Presenter";

export interface LoginView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (...args: any[]) => void;
  originalUrl: string | undefined;
}

export class LoginPresenter extends Presenter<LoginView> {
  private authService: AuthService;
  private _isLoading: boolean = false;

  public constructor(view: LoginView) {
    super(view);
    this.authService = new AuthService();
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public set isLoading(value: boolean) {
    this._isLoading = value;
  }

  public async doLogin(alias: string, password: string, rememberMe: boolean) {
    this.doFailureReportingOperation(
      async () => {
        this._isLoading = true;

        const [user, authToken] = await this.authService.login(alias, password);

        this.view.updateUserInfo(user, user, authToken, rememberMe);

        if (!!this.view.originalUrl) {
          this.view.navigate(this.view.originalUrl);
        } else {
          this.view.navigate(`/feed/${user.alias}`);
        }
      },
      "log user in",
      () => {
        this._isLoading = false;
      }
    );
  }
}
