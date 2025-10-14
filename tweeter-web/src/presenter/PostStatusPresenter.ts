import { Status, AuthToken, User } from "tweeter-shared";
import { MessageView, Presenter } from "./Presenter";

export class PostStatusPresenter extends Presenter<MessageView> {
  private _isLoading: boolean = false;

  public constructor(view: MessageView) {
    super(view);
  }

  public get isLoading() {
    return this._isLoading;
  }

  public async submitPost(
    authToken: AuthToken | null,
    currentUser: User | null,
    post: string,
    setPost: (post: string) => void
  ) {
    var postingStatusToastId = "";

    try {
      this._isLoading = true;
      postingStatusToastId = this.view.displayInfoMessage(
        "Posting status...",
        0
      );

      const status = new Status(post, currentUser!, Date.now());

      await this.postStatus(authToken!, status);

      setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      );
    } finally {
      this.view.deleteMessage(postingStatusToastId);
      this._isLoading = false;
    }
  }

  private async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server to post the status
  }
}
