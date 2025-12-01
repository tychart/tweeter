import { Buffer } from "buffer";
import bcrypt from "bcryptjs";

import { AuthToken, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { AuthDao } from "../dao/AuthDao";
import { UserDao, UserDaoFactory } from "../dao/UserDao";

export class UserService implements Service {
  private authDao: AuthDao;
  private userDao: UserDao;

  constructor(userDaoFactory: UserDaoFactory) {
    this.authDao = userDaoFactory.authDao;
    this.userDao = userDaoFactory.userDao;
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    await this.authDao.validateAuth(token);

    const retrievedUser: UserDto | undefined = await this.userDao.getUser(
      alias
    );

    if (retrievedUser === undefined) {
      return null;
    }

    return retrievedUser;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto | null, AuthToken | null]> {
    const fullUser = await this.userDao.getFullUser(alias);

    if (fullUser === undefined) {
      throw new Error(
        `Error: unauthorized access - Username or Password is incorrect`
      );
    }

    if (await bcrypt.compare(password, fullUser.passHash)) {
      const authToken = AuthToken.Generate();

      await this.authDao.putAuth(authToken, fullUser.userDto.alias);

      return [fullUser.userDto, authToken];
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
    const imgUrl = await this.userDao.putImage(alias, imageStringBase64);

    const userDto = {
      alias: alias,
      firstName: firstName,
      lastName: lastName,
      imageUrl: imgUrl,
    };

    if (userDto === null) {
      return [null, null];
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const addUserSuccess: boolean = await this.userDao.putUser(
      userDto,
      hashedPassword
    );

    const authToken: AuthToken = AuthToken.Generate();

    const addAuthSuccess: boolean = await this.authDao.putAuth(
      authToken,
      alias
    );

    return [userDto, authToken];
  }

  public async logout(token: string): Promise<boolean> {
    // // Pause so we can see the logging out message. Delete when the call to the server is implemented.
    // await new Promise((res) => setTimeout(res, 1000));
    // console.log("Just (fakely) logged out");

    await this.authDao.validateAuth(token);
    await this.authDao.deleteAuth(token);

    return true;
  }
}
