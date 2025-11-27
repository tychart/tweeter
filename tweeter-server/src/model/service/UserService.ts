import { Buffer } from "buffer";

import { AuthToken, User, FakeData, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { UserDaoDynamo } from "../dao/dynamodb/UserDaoDynamo";

export class UserService implements Service {
  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    // TODO: Replace with the result of calling server

    // const retrievedUser = FakeData.instance.findUserByAlias(alias);
    const userDao = new UserDaoDynamo();

    const retrievedUser: UserDto | undefined = await userDao.getUser(alias);

    if (retrievedUser === undefined) {
      return null;
    }

    return retrievedUser;
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
    // const user = FakeData.instance.firstUser;

    const userDto = {
      alias: alias,
      firstName: firstName,
      lastName: lastName,
      imageUrl: "htp://fake-url.cm",
    };

    const userDao = new UserDaoDynamo();
    const success: boolean = await userDao.putUser(
      userDto,
      "Myfakepasswordhash64"
    );

    if (userDto === null) {
      return [null, null];
    }

    return [userDto, FakeData.instance.authToken];
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
