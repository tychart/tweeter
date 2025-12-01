import { AuthDao } from "./AuthDao";
import { FollowDao } from "./FollowDao";
import { UserDao } from "./UserDao";

export interface DaoFactory {
  authDao: AuthDao;
  userDao: UserDao;
  followDao: FollowDao;
}
