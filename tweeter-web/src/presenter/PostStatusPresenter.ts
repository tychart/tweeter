import { Status, AuthToken, User } from "tweeter-shared";
import { MessageView, Presenter } from "./Presenter";
import { StatusService } from "../model/service/StatusService";

export interface PostStatusView extends MessageView {
  clearPost: () => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  private _isLoading: boolean = false;
  private _service: StatusService;

  public constructor(view: PostStatusView) {
    super(view);
    this._service = new StatusService();
  }

  public get isLoading() {
    return this._isLoading;
  }

  public get service() {
    return this._service;
  }

  public async submitPost(
    authToken: AuthToken,
    currentUser: User,
    post: string
  ) {
    var postingStatusToastId = "";

    await this.doFailureReportingOperation(
      async () => {
        this._isLoading = true;
        postingStatusToastId = this.view.displayInfoMessage(
          "Posting status...",
          0
        );

        const status = new Status(post, currentUser!, Date.now());

        await this.service.postStatus(authToken!, currentUser.alias, status);

        this.view.clearPost();
        this.view.displayInfoMessage("Status posted!", 2000);
      },
      "post the status",
      () => {
        this.view.deleteMessage(postingStatusToastId);
        this._isLoading = false;
      }
    );
  }
}
