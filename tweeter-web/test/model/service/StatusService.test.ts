import "isomorphic-fetch"; // fetch polyfill for Node.js
import { StatusService } from "../../../src/model/service/StatusService"; // path may vary
import { AuthToken, FakeData, Status } from "tweeter-shared";

describe("Status Service Integration", () => {
  const statusService = new StatusService();

  test("Gets the story pages", async () => {
    const [statuses, hasMore]: [Status[], boolean] =
      await statusService.loadMoreStoryItems(
        new AuthToken("Test Auth Token", 50),
        "@TestUserAlias",
        10,
        null
      );

    expect(statuses[0].dto).toEqual(FakeData.instance.fakeStatuses[0].dto);
    expect(statuses.length).toBe(10);
    expect(hasMore).toBe(true);
  });
});
