import { AuthToken, Status, FakeData, StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { StatusDao, StatusDaoFactory } from "../dao/StatusDao";
import { AuthDao } from "../dao/AuthDao";
import { UserDao } from "../dao/UserDao";

export class StatusService implements Service {
  private authDao: AuthDao;
  private userDao: UserDao;
  private statusDao: StatusDao;

  constructor(statusDaoFactory: StatusDaoFactory) {
    this.authDao = statusDaoFactory.authDao;
    this.userDao = statusDaoFactory.userDao;
    this.statusDao = statusDaoFactory.statusDao;
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return this.getFakeData(lastItem, pageSize);
  }

  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return this.getFakeData(lastItem, pageSize);
  }

  private async getFakeData(
    lastItem: StatusDto | null,
    pageSize: number
  ): Promise<[StatusDto[], boolean]> {
    const [items, hasMore] = FakeData.instance.getPageOfStatuses(
      Status.fromDto(lastItem),
      pageSize
    );

    // console.log("getFakeData:lastItem =", JSON.stringify(lastItem));
    // console.log("getFakeData:pageSize =", pageSize);

    // const cursor = Status.fromDto(lastItem as any); // current signature forces `any`
    // console.log("cursor after fromDto:", cursor);

    // console.log("returned count:", items.length, "hasMore:", hasMore);

    const dtos = items.map((status) => status.dto);

    // console.log("last dto returned:", dtos[dtos.length - 1]);

    return [dtos, hasMore];
  }

  public async postStatus(
    token: string,
    newStatus: StatusDto
  ): Promise<boolean> {
    // Pause so we can see the logging out message. Remove when connected to the server
    // await new Promise((f) => setTimeout(f, 2000));
    // console.log("Just (fakely) 'posted': ", newStatus.post);

    await this.authDao.validateAuth(token);

    await this.statusDao.putPost(
      newStatus.user.alias,
      newStatus.timestamp,
      newStatus.post
    );

    return true;

    // TODO: Call the server to post the status
  }
}
