import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import { LoginPresenter } from "../../../../src/presenter/LoginPresenter";

library.add(fab);

describe("Login Component", () => {
  it("starts with the sign in button disabled", () => {
    const { signInButtom } = renderLoginAndGetElement("/");

    expect(signInButtom).toBeDisabled();
  });

  it("enables the sign in button if both alias and password fields have text", async () => {
    const { signInButtom, aliasField, passwordField, user } =
      renderLoginAndGetElement("/");

    await user.type(aliasField, "testalies");
    await user.type(passwordField, "testpass");

    expect(signInButtom).toBeEnabled();
  });

  it("disables the sign in button if either the alias or the password field is cleared", async () => {
    const { signInButtom, aliasField, passwordField, user } =
      renderLoginAndGetElement("/");

    await user.type(aliasField, "testalies");
    await user.type(passwordField, "testpass");

    expect(signInButtom).toBeEnabled();

    await user.clear(aliasField);

    expect(signInButtom).toBeDisabled();

    await user.type(aliasField, "testalies");

    expect(signInButtom).toBeEnabled();

    await user.clear(passwordField);

    expect(signInButtom).toBeDisabled();
  });

  it("calls the presenter's login method with correct parameters when the sign in button is pressed", async () => {
    const mockPresenter = mock<LoginPresenter>();
    const mockPresenterInstance = instance(mockPresenter);
    const originalUrl = "https://example.com";
    const alias = "@alias";
    const password = "myPassword";

    const { signInButtom, aliasField, passwordField, user } =
      renderLoginAndGetElement(originalUrl, mockPresenterInstance);

    await user.type(aliasField, alias);
    await user.type(passwordField, password);

    await user.click(signInButtom);

    verify(mockPresenter.doLogin(alias, password, false)).once();
  });
});

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <Login originalUrl={originalUrl} presenter={presenter} />
      ) : (
        <Login originalUrl={originalUrl} />
      )}
    </MemoryRouter>
  );
}

function renderLoginAndGetElement(
  originalUrl: string,
  presenter?: LoginPresenter
) {
  const user = userEvent.setup();

  renderLogin(originalUrl, presenter);

  const signInButtom = screen.getByRole("button", { name: /Sign in/i });
  const aliasField = screen.getByLabelText(/alias/i);
  const passwordField = screen.getByLabelText(/password/i);

  return { user, signInButtom, aliasField, passwordField };
}
