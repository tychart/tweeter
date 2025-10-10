import { AuthToken, User } from "tweeter-shared";
import { UserInfoService } from "../model.service/UserInfoService";

export interface UserInfoView {
  displayErrorMessage: (message: string) => string;
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (messageId: string) => void;
}

export class UserInfoPresenter {
  private view: UserInfoView;
  private _followerCount: number = -1;
  private _followeeCount: number = -1;
  private _isFollower: boolean = false;
  private userInfoService: UserInfoService;

  public constructor(view: UserInfoView) {
    this.view = view;
    this.userInfoService = new UserInfoService();
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    try {
      this._followerCount = await this.userInfoService.getFollowerCount(
        authToken,
        displayedUser
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followers count because of exception: ${error}`
      );
    }
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    try {
      this._followeeCount = await this.userInfoService.getFolloweeCount(
        authToken,
        displayedUser
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followees count because of exception: ${error}`
      );
    }
  }

  public async attemptFollowChange(
    setIsLoading: (value: React.SetStateAction<boolean>) => void,
    changeRequest: string,
    followMessage: string,
    failedMessage: string,
    authToken: AuthToken | null,
    displayedUser: User | null
  ) {
    var followingUserToast = "";

    try {
      setIsLoading(true);
      followingUserToast = this.view.displayInfoMessage(followMessage, 0);

      if (changeRequest == "follow") {
        await this.follow(authToken!, displayedUser!);
      } else if (changeRequest == "unfollow") {
        await this.unfollow(authToken!, displayedUser!);
      }
    } catch (error) {
      this.view.displayErrorMessage(`${failedMessage}${error}`);
    } finally {
      this.view.deleteMessage(followingUserToast);
      setIsLoading(false);
    }
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so we can see the follow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const followerCount = await this.userInfoService.getFollowerCount(
      authToken,
      userToFollow
    );
    const followeeCount = await this.userInfoService.getFolloweeCount(
      authToken,
      userToFollow
    );

    this._isFollower = true;
    this._followerCount = followerCount;
    this._followeeCount = followeeCount;

    return [followerCount, followeeCount];
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so we can see the unfollow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const followerCount = await this.userInfoService.getFollowerCount(
      authToken,
      userToUnfollow
    );
    const followeeCount = await this.userInfoService.getFolloweeCount(
      authToken,
      userToUnfollow
    );

    this._isFollower = false;
    this._followerCount = followerCount;
    this._followeeCount = followeeCount;

    return [followerCount, followeeCount];
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    try {
      if (currentUser === displayedUser) {
        this._isFollower = false;
      } else {
        this._isFollower = await this.userInfoService.getIsFollowerStatus(
          authToken!,
          currentUser!,
          displayedUser!
        );
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to determine follower status because of exception: ${error}`
      );
    }
  }

  public get followerCount() {
    return this._followerCount;
  }

  public get followeeCount() {
    return this._followeeCount;
  }

  public get isFollower() {
    return this._isFollower;
  }
}
