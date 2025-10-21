import { AuthToken, User, FakeData } from "tweeter-shared";
import { Service } from "./Service";

export class UserService implements Service {
  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.findUserByAlias(alias);
  }

  // In this file, he has login, register and logout, to see go to here:
  // https://youtu.be/sZ2ezpJXXQo?t=2284

  public async logout(authToken: AuthToken): Promise<void> {
    // Pause so we can see the logging out message. Delete when the call to the server is implemented.
    await new Promise((res) => setTimeout(res, 1000));
  }
}
