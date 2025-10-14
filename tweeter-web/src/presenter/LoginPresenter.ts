import { User, AuthToken } from "tweeter-shared";
import { AuthPresenter } from "./AuthPresenter";

// export interface LoginView extends View {
//   updateUserInfo: (
//     currentUser: User,
//     displayedUser: User | null,
//     authToken: AuthToken,
//     remember: boolean
//   ) => void;
//   navigate: (...args: any[]) => void;
//   originalUrl: string | undefined;
// }

export class LoginPresenter extends AuthPresenter {
  // private authService: AuthService;
  // private _isLoading: boolean = false;

  // public constructor(view: LoginView) {
  //   super(view);
  //   this.authService = new AuthService();
  // }

  // public get isLoading(): boolean {
  //   return this._isLoading;
  // }

  // public set isLoading(value: boolean) {
  //   this._isLoading = value;
  // }

  //doAuthenticationOperation - Video 1:39

  public async doLogin(alias: string, password: string, rememberMe: boolean) {
    this.doFailureReportingOperation(
      async () => {
        this.isLoading = true;

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
        this.isLoading = false;
      }
    );
  }

  // protected async interactService(): Promise<[User, AuthToken]> {
  //   return await this.authService.login(alias, password);
  // }
}
