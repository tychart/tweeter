import "isomorphic-fetch"; // fetch polyfill for Node.js
import { ServerFacade } from "../../../src/model/network/ServerFacade"; // path may vary
import {
  RegisterRequest,
  AuthToken,
  User,
  FakeData,
  PagedUserItemRequest,
  CountRequest,
} from "tweeter-shared";

describe("ServerFacade Integration", () => {
  const serverFacade = new ServerFacade();

  test("registers a user", async () => {
    const requestObj: RegisterRequest = {
      firstName: "testFirstName",
      lastName: "testLastName",
      userAlias: "testUserName",
      password: "testPassword",
      imageStringBase64: "https://test.com/avatar.png",
      imageFileExtension: "desktop",
    };
    const [user, authToken]: [User, AuthToken] = await serverFacade.register(
      requestObj
    );

    expect(user.dto).toEqual(FakeData.instance.firstUser?.dto);
    expect(user.alias).toBe(FakeData.instance.firstUser?.alias);
    // Test other fields of response as needed
  });

  test("gets followers", async () => {
    const requestObj: PagedUserItemRequest = {
      token: "testFirstName",
      userAlias: "testUserName",
      pageSize: 10,
      lastItem: null,
    };

    const [users, hasMore]: [User[], boolean] =
      await serverFacade.getMoreFollowers(requestObj);

    expect(users[0].dto).toEqual(FakeData.instance.firstUser?.dto);
    expect(users.length).toBe(10);
  });

  test("gets the followers count", async () => {
    const requestObj: CountRequest = {
      token: "testFirstName",
      userAlias: "testUserName",
      user: {
        firstName: "Tyler",
        lastName: "Chartrand",
        alias: "testUserName",
        imageUrl: "testImageUrl",
      },
    };

    const count: number = await serverFacade.getFollowerCount(requestObj);

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(11);
  });
});
