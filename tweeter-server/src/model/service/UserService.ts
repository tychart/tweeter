import { Buffer } from "buffer";

import { AuthToken, User, FakeData, UserDto } from "tweeter-shared";
import { Service } from "./Service";

export class UserService implements Service {
  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    // TODO: Replace with the result of calling server

    const retrievedUser = FakeData.instance.findUserByAlias(alias);

    if (retrievedUser === null) {
      return null;
    }

    return retrievedUser.dto;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto | null, AuthToken | null]> {
    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      return [null, null];
    }

    return [user.dto, FakeData.instance.authToken];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageStringBase64: string,
    imageFileExtension: string
  ): Promise<[UserDto | null, AuthToken | null]> {
    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      return [null, null];
    }

    return [user.dto, FakeData.instance.authToken];
  }

  // In this file, he has login, register and logout, to see go to here:
  // https://youtu.be/sZ2ezpJXXQo?t=2284

  public async logout(token: string): Promise<boolean> {
    // Pause so we can see the logging out message. Delete when the call to the server is implemented.
    await new Promise((res) => setTimeout(res, 1000));

    console.log("Just (fakely) logged out");

    return true;
  }
}
