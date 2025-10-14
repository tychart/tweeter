import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { AuthService } from "../model.service/AuthService";

export interface AuthView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (...args: any[]) => void;
  originalUrl: string | undefined;
}

export abstract class AuthPresenter extends Presenter<AuthView> {
  protected authService: AuthService;
  private _isLoading: boolean = false;

  public constructor(view: AuthView) {
    super(view);
    this.authService = new AuthService();
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public set isLoading(value: boolean) {
    this._isLoading = value;
  }

  // protected async doAuthenticationOperation(
  //   authFunction: () => Promise<[User, AuthToken]>
  // ) {
  //   this.isLoading = true;
  //   authFunction();

  //   this.view.updateUserInfo(user, user, authToken, rememberMe);
  // }

  // protected abstract interactService(): Promise<[User, AuthToken]>;
}
