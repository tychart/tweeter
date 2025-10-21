import {
  anyOfClass,
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenter/PostStatusPresenter";
import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../../src/model.service/StatusService";

describe("PostStatusPresenter", () => {
  let mockPostStatusView: PostStatusView;
  let postStatusPresenter: PostStatusPresenter;
  let mockService: StatusService;

  // const mockPostStatusPresenter = new PostStatusPresenter(
  //   mockNavbarPresenterView
  // );

  const authToken: AuthToken = new AuthToken("test", Date.now());
  const currentUser: User = new User("test", "chartrand", "tchart", "na");

  beforeEach(() => {
    // View
    mockPostStatusView = mock<PostStatusView>();
    const mockPostStatusViewInstance = instance(mockPostStatusView);

    // Presenter
    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockPostStatusViewInstance)
    );
    postStatusPresenter = instance(postStatusPresenterSpy);

    // Service
    mockService = mock<StatusService>();
    const mockServiceInstance = instance(mockService);

    // Overrides
    when(postStatusPresenterSpy.service).thenReturn(mockServiceInstance);
    when(mockPostStatusView.displayInfoMessage(anything(), 0)).thenReturn(
      "messageid123"
    );
  });

  it("tells the view to display a posting status message", async () => {
    await postStatusPresenter.submitPost(authToken, currentUser, "Test Post");

    verify(
      mockPostStatusView.displayInfoMessage("Posting status...", 0)
    ).once();
  });

  it("calls postStatus on the post status service with the correct status string and auth token", async () => {
    await postStatusPresenter.submitPost(authToken, currentUser, "Test Post");

    verify(mockService.postStatus(authToken, anyOfClass(Status))).once();

    let [capturedAuthToken, capturedStatus] = capture(
      mockService.postStatus
    ).last();

    expect(capturedAuthToken).toBe(authToken);
    expect(capturedStatus.post).toBe("Test Post");
  });

  it("tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message when successful", async () => {
    await postStatusPresenter.submitPost(authToken, currentUser, "Test Post");

    // let [capturedId] = capture(mockPostStatusView.displayInfoMessage).first();

    // console.log(capturedId);

    verify(mockPostStatusView.deleteMessage("messageid123")).once();
    verify(mockPostStatusView.clearPost()).once();
    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000)
    ).once();
  });

  it("tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message when not successful", async () => {
    let error = new Error("A fake error occured");

    when(mockService.postStatus(anything(), anything())).thenThrow(error);

    await postStatusPresenter.submitPost(authToken, currentUser, "Test Post");

    verify(
      mockPostStatusView.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      )
    ).once();

    verify(mockPostStatusView.deleteMessage("messageid123")).once();
    verify(mockPostStatusView.clearPost()).never();
    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000)
    ).never();
  });
});
