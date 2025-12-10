export interface PostQueueMessage {
  authorAlias: string;
  timestamp: number;
  post: string;
}

export interface FeedJobMessage {
  authorAlias: string;
  timestamp: number;
  post: string;
  followerAliases: string[]; // this is a chunk of (25) aliases
}

// export interface QueueDaoFactory {
//   authDao: AuthDao;
//   userDao: UserDao;
//   followDao: FollowDao;
// }

export interface QueueDao {
  putStatusPostsQueue(postQueueMessage: PostQueueMessage): Promise<boolean>;

  putJobJobsQueue(newJob: FeedJobMessage): Promise<boolean>;
}
