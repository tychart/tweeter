import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { FeedDaoDynamo } from "../../model/dao/dynamodb/FeedDaoDynamo";
import { FollowDaoDynamo } from "../../model/dao/dynamodb/FollowDaoDynamo";
import { QueueDaoDynamo } from "../../model/dao/dynamodb/QueueDaoDynamo";
import { StatusDaoDynamo } from "../../model/dao/dynamodb/StatusDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { FeedJobMessage } from "../../model/dao/QueueDao";
import { StatusDaoFactory } from "../../model/dao/StatusDao";
import { StatusService } from "../../model/service/StatusService";

export const handler = async function (event: any) {
  const statusDaoFactory: StatusDaoFactory = {
    authDao: new AuthDaoDynamo(),
    userDao: new UserDaoDynamo(),
    followDao: new FollowDaoDynamo(),
    statusDao: new StatusDaoDynamo(),
    feedDao: new FeedDaoDynamo(),
    queueDao: new QueueDaoDynamo(),
  };

  // console.log("This is the value of the whole event: ", event);
  for (const record of event.Records) {
    const job = JSON.parse(record.body) as FeedJobMessage;

    const statusService = new StatusService(statusDaoFactory);

    await statusService.processFeedJobMessage(job);
  }
  return null;
};
