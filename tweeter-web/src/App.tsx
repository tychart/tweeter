import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import ItemScroller from "./components/mainLayout/ItemScroller";
import StatusItemScroller from "./components/mainLayout/StatusItemScroller";
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { Status, User } from "tweeter-shared";
import UserItem from "./components/userItem/UserItem";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  // Put the itemComponentFactories right here, then call them below
  const userItemComponentFactory = (
    item: User,
    featurePath: string
  ): JSX.Element => {
    return <UserItem user={item} featurePath={featurePath} />;
  };

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
        <Route
          path="feed/:displayedUser"
          element={
            <StatusItemScroller
              key={`feed-${displayedUser!.alias}`}
              featurePath="/feed"
              presenterFactory={(view: PagedItemView<Status>) =>
                new FeedPresenter(view)
              }
            />
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <StatusItemScroller
              key={`story-${displayedUser!.alias}`}
              featurePath="/story"
              presenterFactory={(view: PagedItemView<Status>) =>
                new StoryPresenter(view)
              }
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller
              key={`followees-${displayedUser!.alias}`}
              featurePath="/followees"
              presenterFactory={(view: PagedItemView<User>) =>
                new FolloweePresenter(view)
              }
              itemComponentFactory={userItemComponentFactory}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller
              key={`followers-${displayedUser!.alias}`}
              featurePath="/followers"
              presenterFactory={(view: PagedItemView<User>) =>
                new FollowerPresenter(view)
              }
              itemComponentFactory={userItemComponentFactory}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
