import { Buffer } from "buffer";
import bcrypt from "bcryptjs";

import { AuthToken, User, FakeData, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { UserDaoDynamo } from "../dao/dynamodb/UserDaoDynamo";
import { AuthDao } from "../dao/AuthDao";
import { AuthDaoDynamo } from "../dao/dynamodb/AuthDaoDynamo";

export class UserService implements Service {
  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    // TODO: Replace with the result of calling server
    // const retrievedUser = FakeData.instance.findUserByAlias(alias);
    const userDao = new UserDaoDynamo();
    const authDao = new AuthDaoDynamo();

    await authDao.validateAuth(token);

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
    // const user = FakeData.instance.firstUser;

    const userDao = new UserDaoDynamo();

    const fullUser: [UserDto, string] | undefined = await userDao.getFullUser(
      alias
    );

    if (fullUser === undefined) {
      return [null, null];
    }

    const [userDto, passHash] = fullUser;

    if (await bcrypt.compare(password, passHash)) {
      const authToken = AuthToken.Generate();

      const authDao = new AuthDaoDynamo();

      authDao.putAuth(authToken, userDto.alias);

      return [userDto, authToken];
    }

    throw new Error(
      `Error: unauthorized access - Password for ${alias} is incorrect`
    );
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

    if (userDto === null) {
      return [null, null];
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userDao = new UserDaoDynamo();
    const addUserSuccess: boolean = await userDao.putUser(
      userDto,
      hashedPassword
    );

    const authToken: AuthToken = AuthToken.Generate();

    const authDao: AuthDao = new AuthDaoDynamo();
    const addAuthSuccess: boolean = await authDao.putAuth(authToken, alias);

    return [userDto, authToken];
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
