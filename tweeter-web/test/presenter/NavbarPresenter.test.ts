import { AuthToken } from "tweeter-shared";
import {
  NavbarPresenter,
  NavbarView,
} from "../../src/presenter/NavbarPresenter";

import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { UserService } from "../../src/model.service/UserService";

describe("NavbarPresenter", () => {
  let mockNavbarPresenterView: NavbarView;
  let navbarPresenter: NavbarPresenter;
  let mockService: UserService;

  const authToken: AuthToken = new AuthToken("test", Date.now());

  beforeEach(() => {
    mockNavbarPresenterView = mock<NavbarView>();
    const mockNavbarPresenterViewInstance = instance(mockNavbarPresenterView);

    when(mockNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn(
      "messageid123"
    );

    const navbarPresenterSpy = spy(
      new NavbarPresenter(mockNavbarPresenterViewInstance)
    );
    navbarPresenter = instance(navbarPresenterSpy);

    mockService = mock<UserService>();
    const mockServiceInstance = instance(mockService);

    when(navbarPresenterSpy.service).thenReturn(mockServiceInstance);
  });

  it("tells the view to display a logging out message", async () => {
    await navbarPresenter.logOut(authToken);
    verify(
      mockNavbarPresenterView.displayInfoMessage("Logging Out...", 0)
    ).once();
  });

  it("calls logout on the user service with the correct auth token", async () => {
    await navbarPresenter.logOut(authToken);
    verify(mockService.logout(authToken)).once();

    // Identical/Redundent Test to the previous
    let [capturedAuthToken] = capture(mockService.logout).last();
    expect(capturedAuthToken).toEqual(authToken);
  });

  it("tells the view to clear the info message that was displayed previously, clears the user info, and navigates to the login page on successful logout", async () => {
    await navbarPresenter.logOut(authToken);

    verify(mockNavbarPresenterView.deleteMessage("messageid123")).once();
    verify(mockNavbarPresenterView.clearUserInfo()).once();
    verify(mockNavbarPresenterView.navigate("/login")).once();

    verify(mockNavbarPresenterView.displayErrorMessage(anything())).never();
  });

  it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page on unsuccessful logout", async () => {
    let error = new Error("A fake error occured");

    when(mockService.logout(anything())).thenThrow(error);

    await navbarPresenter.logOut(authToken);

    verify(
      mockNavbarPresenterView.displayErrorMessage(
        `Failed to log user out because of exception: ${error}`
      )
    ).once();

    verify(mockNavbarPresenterView.deleteMessage(anything())).never();
    verify(mockNavbarPresenterView.clearUserInfo()).never();
    verify(mockNavbarPresenterView.navigate("/login")).never();
  });
});
