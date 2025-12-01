import {
  AuthToken,
  Status,
  FakeData,
  StatusDto,
  FollowDto,
} from "tweeter-shared";
import { Service } from "./Service";
import { StatusDao, StatusDaoFactory } from "../dao/StatusDao";
import { AuthDao } from "../dao/AuthDao";
import { UserDao } from "../dao/UserDao";
import { FollowDao } from "../dao/FollowDao";
import { FeedDao, FeedDaoFactory } from "../dao/FeedDao";
import { DataPageDto } from "tweeter-shared";
import { SmallStatusDto } from "tweeter-shared";

export class StatusService implements Service {
  private authDao: AuthDao;
  private userDao: UserDao;
  private followDao: FollowDao;
  private statusDao: StatusDao;
  private feedDao: FeedDao;

  constructor(feedDaoFactory: FeedDaoFactory) {
    this.authDao = feedDaoFactory.authDao;
    this.userDao = feedDaoFactory.userDao;
    this.followDao = feedDaoFactory.followDao;
    this.statusDao = feedDaoFactory.statusDao;
    this.feedDao = feedDaoFactory.feedDao;
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    // return this.getFakeData(lastItem, pageSize);

    await this.authDao.validateAuth(token);

    const dataPage: DataPageDto<SmallStatusDto> =
      await this.feedDao.getPageOfFeed(
        pageSize,
        userAlias,
        lastItem?.timestamp
      );

    const statuses: StatusDto[] = [];

    for (const item of dataPage.values) {
      const userDto = await this.userDao.getUser(item.alias);

      if (userDto !== undefined) {
        const statusDto: StatusDto = {
          user: userDto,
          post: item.post,
          timestamp: item.timestamp,
        };

        statuses.push(statusDto);
      } else {
        console.log("Could not find a user with alias of ", item.alias);
      }
    }

    return [statuses, dataPage.hasMorePages];
  }

  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    // return this.getFakeData(lastItem, pageSize);

    await this.authDao.validateAuth(token);

    const dataPage: DataPageDto<SmallStatusDto> =
      await this.statusDao.getPageOfStory(
        pageSize,
        userAlias,
        lastItem?.timestamp
      );

    const statuses: StatusDto[] = [];

    for (const item of dataPage.values) {
      const userDto = await this.userDao.getUser(item.alias);

      if (userDto !== undefined) {
        const statusDto: StatusDto = {
          user: userDto,
          post: item.post,
          timestamp: item.timestamp,
        };

        statuses.push(statusDto);
      } else {
        console.log("Could not find a user with alias of ", item.alias);
      }
    }

    return [statuses, dataPage.hasMorePages];
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

    /// Update Everyone Else's Feed ///

    const followers: FollowDto[] = [];
    let hasMorePages = true;
    let lastFollowerHandle = undefined;

    while (hasMorePages) {
      const dataPage: DataPageDto<FollowDto> =
        await this.followDao.getPageOfFollowers(
          25,
          newStatus.user.alias,
          lastFollowerHandle
        );

      hasMorePages = dataPage.hasMorePages;

      for (let followerDto of dataPage.values) {
        await this.feedDao.putPost(
          followerDto.followerAlias,
          newStatus.timestamp,
          newStatus.user.alias,
          newStatus.post
        );
      }

      lastFollowerHandle =
        dataPage.values[dataPage.values.length - 1]?.followerAlias;
    }

    return true;
  }
}
