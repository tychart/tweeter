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
import {
  AuthToken,
  LoginRequest,
  Status,
  User,
  PagedStatusItemRequest,
} from "tweeter-shared";
import { StatusService } from "../../src/model/service/StatusService";
import { ServerFacade } from "../../src/model/network/ServerFacade";

describe("PostStatusPresenter", () => {
  let mockPostStatusView: PostStatusView;
  let postStatusPresenter: PostStatusPresenter;
  let mockService: StatusService;
  let currentUser: User;
  let authToken: AuthToken;

  const serverFacade = new ServerFacade();

  // const authToken: AuthToken = new AuthToken("test", Date.now());
  // const currentUser: User = new User("test", "chartrand", "tchart", "na");

  beforeAll(async () => {
    const requestObj: LoginRequest = {
      userAlias: "@rek",
      password: "test",
    };

    [currentUser, authToken] = await serverFacade.login(requestObj);
  });

  beforeEach(() => {
    // View
    mockPostStatusView = mock<PostStatusView>();
    const mockPostStatusViewInstance = instance(mockPostStatusView);

    // Presenter
    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockPostStatusViewInstance)
    );
    postStatusPresenter = instance(postStatusPresenterSpy);

    // // Service
    // mockService = mock<StatusService>();
    // const mockServiceInstance = instance(mockService);

    // // Overrides
    // when(postStatusPresenterSpy.service).thenReturn(mockServiceInstance);
    // when(mockPostStatusView.displayInfoMessage(anything(), 0)).thenReturn(
    //   "messageid123"
    // );

    // postStatusPresenter = new PostStatusPresenter(view);
  });

  it("posts a status and appends it to the user's story", async () => {
    const statusText = `Test status for intigration test ${Date.now()}`;
    const timestampBefore = Date.now();

    await postStatusPresenter.submitPost(authToken, currentUser, statusText);

    // await new Promise((f) => setTimeout(f, 2000));

    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000)
    ).once();

    const pagedStatusItemRequest: PagedStatusItemRequest = {
      token: authToken.token,
      userAlias: "@rek",
      pageSize: 1,
      lastItem: null,
    };

    const [statusList, hasMore] = await serverFacade.getMoreStoryItems(
      pagedStatusItemRequest
    );

    expect(statusList[0].post).toBe(statusText);
    expect(statusList[0].user.alias).toBe("@rek");
    expect(statusList[0].timestamp).toBeGreaterThanOrEqual(timestampBefore);
  }, 15000);
});
