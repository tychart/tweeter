import userEvent from "@testing-library/user-event";
import PostStatus from "../../../src/components/postStatus/PostStatus";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useUserInfo } from "../../../src/components/userInfo/UserInfoHooks";
import { AuthToken, User } from "tweeter-shared";
import { capture, instance, mock, verify } from "@typestrong/ts-mockito";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";

// Mock the user info hook so the component thinks the user is logged in
// I am still not sure how this works, we never talked about mocking hooks
jest.mock("../../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

describe("Post Status Component", () => {
  const currentUser: User = new User("example", "chartrand", "@example", "na");
  const authToken: AuthToken = new AuthToken("token", Date.now());

  beforeAll(() => {
    // const currentUser: User

    // const authToken: AuthToken

    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: currentUser,
      authToken: authToken,
    });
  });

  it("starts with the post and clear buttons disabled", () => {
    const { postStatusButton, clearStatusButton } = renderAndGetElements();

    expect(postStatusButton).toBeDisabled();
    expect(clearStatusButton).toBeDisabled();
  });

  it("has both buttons enabled when the field has text", async () => {
    const { user, postStatusButton, clearStatusButton, textArea } =
      renderAndGetElements();

    await user.type(textArea, "Hello World");

    expect(postStatusButton).toBeEnabled();
    expect(clearStatusButton).toBeEnabled();
  });

  it("has both buttons disabled after the text field has been cleared", async () => {
    const { user, postStatusButton, clearStatusButton, textArea } =
      renderAndGetElements();

    await user.type(textArea, "Hello World");
    await user.clear(textArea);

    expect(postStatusButton).toBeDisabled();
    expect(clearStatusButton).toBeDisabled();
  });

  it("called the postStatus method with correct parameters when the Post Status button is pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const { user, postStatusButton, textArea } = renderAndGetElements(
      mockPresenterInstance
    );

    await user.type(textArea, "Hello World");
    await user.click(postStatusButton);

    verify(
      mockPresenter.submitPost(authToken, currentUser, "Hello World")
    ).once();
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  if (presenter) {
    return render(<PostStatus presenter={presenter} />);
  } else {
    return render(<PostStatus />);
  }
}

function renderAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();

  renderPostStatus(presenter);

  const postStatusButton = screen.getByRole("button", {
    name: /Post Status Button/i,
  });

  const clearStatusButton = screen.getByRole("button", {
    name: /Clear Status Button/i,
  });

  const textArea = screen.getByRole("textbox", {
    name: /Post Status Text Area/i,
  });

  return { user, postStatusButton, clearStatusButton, textArea };
}
