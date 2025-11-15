import { Buffer } from "buffer";

import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class UserService implements Service {
  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    // TODO: Replace with the result of calling server
    // return FakeData.instance.findUserByAlias(alias);

    const serverFacade = new ServerFacade();

    return serverFacade.getUser({
      token: authToken.token,
      userAlias: alias,
    });
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    // TODO: Replace with the result of calling the server
    // const user = FakeData.instance.firstUser;

    // if (user === null) {
    //   throw new Error("Invalid alias or password");
    // }

    // return [user, FakeData.instance.authToken];

    const serverFacade = new ServerFacade();

    const [user, authToken] = await serverFacade.login({
      userAlias: alias,
      password: password,
    });

    return [user, authToken];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    // Not neded now, but will be needed when you make the request to the server in milestone 3
    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");

    // TODO: Replace with the result of calling the server
    // const user = FakeData.instance.firstUser;

    // if (user === null) {
    //   throw new Error("Invalid registration");
    // }

    // return [user, FakeData.instance.authToken];

    const serverFacade = new ServerFacade();

    const [user, authToken] = await serverFacade.register({
      firstName: firstName,
      lastName: lastName,
      userAlias: alias,
      password: password,
      imageStringBase64: imageStringBase64,
      imageFileExtension: imageFileExtension,
    });

    return [user, authToken];
  }

  // In this file, he has login, register and logout, to see go to here:
  // https://youtu.be/sZ2ezpJXXQo?t=2284

  public async logout(authToken: AuthToken): Promise<void> {
    // Pause so we can see the logging out message. Delete when the call to the server is implemented.
    // await new Promise((res) => setTimeout(res, 1000));

    const serverFacade = new ServerFacade();

    await serverFacade.logout(authToken);
  }
}
