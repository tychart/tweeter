import { AuthDaoDynamo } from "../../model/dao/dynamodb/AuthDaoDynamo";
import { FeedDaoDynamo } from "../../model/dao/dynamodb/FeedDaoDynamo";
import { FollowDaoDynamo } from "../../model/dao/dynamodb/FollowDaoDynamo";
import { QueueDaoDynamo } from "../../model/dao/dynamodb/QueueDaoDynamo";
import { StatusDaoDynamo } from "../../model/dao/dynamodb/StatusDaoDynamo";
import { UserDaoDynamo } from "../../model/dao/dynamodb/UserDaoDynamo";
import { PostQueueMessage } from "../../model/dao/QueueDao";
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

  console.log("This is the value of the whole event: ", event);

  for (let i = 0; i < event.Records.length; ++i) {
    let { body } = event.Records[i];
    // TODO: Add code to print message body to the log.

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        console.error("Invalid JSON body:", body);
        continue;
      }
    }

    if (!isPostQueueMessage(body)) {
      console.error("Body is not a valid PostQueueMessage:", body);
      continue;
    }

    const postQueueMessage: PostQueueMessage = body;

    console.log("Validated PostQueueMessage: ", postQueueMessage);

    const statusService = new StatusService(statusDaoFactory);

    await statusService.putJobFeedJobMessage(postQueueMessage);
  }
  return null;
};

// PostQueueMessage type guard
function isPostQueueMessage(value: any): value is PostQueueMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.authorAlias === "string" &&
    typeof value.timestamp === "number" &&
    typeof value.post === "string"
  );
}
