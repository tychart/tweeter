import { Status, AuthToken, User } from "tweeter-shared";
import { MessageView, Presenter } from "./Presenter";
import { StatusService } from "../model.service/StatusService";

export class PostStatusPresenter extends Presenter<MessageView> {
  private _isLoading: boolean = false;
  private _service: StatusService;

  public constructor(view: MessageView) {
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
    authToken: AuthToken | null,
    currentUser: User | null,
    post: string,
    setPost: (post: string) => void
  ) {
    var postingStatusToastId = "";

    this.doFailureReportingOperation(
      async () => {
        this._isLoading = true;
        postingStatusToastId = this.view.displayInfoMessage(
          "Posting status...",
          0
        );

        const status = new Status(post, currentUser!, Date.now());

        await this.service.postStatus(authToken!, status);

        setPost("");
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
