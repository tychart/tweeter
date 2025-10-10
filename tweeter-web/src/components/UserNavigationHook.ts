import { useUserInfo, useUserInfoActions } from "./userInfo/UserInfoHooks";
import { useNavigate } from "react-router-dom";
import { useMessageActions } from "./toaster/MessageHooks";
import {
  UserNavigationPresenter,
  UserNavigationView,
} from "../presenter/UserNavigationPresenter";
import { useRef } from "react";

export const useUserNavigation = (featurePath: string) => {
  const { displayErrorMessage } = useMessageActions();
  const navigate = useNavigate();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();

  const listener: UserNavigationView = {
    displayErrorMessage: displayErrorMessage,
    setDisplayedUser: setDisplayedUser,
    navigate: navigate,
    featurePath: featurePath,
  };

  const presenterRef = useRef<UserNavigationPresenter>(
    new UserNavigationPresenter(listener)
  );

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();

    presenterRef.current.navigateToUser(event, displayedUser, authToken);
  };

  return navigateToUser;
};
