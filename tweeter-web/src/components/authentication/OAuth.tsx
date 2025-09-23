// Talks about at 1:04:30 - 1:05:15

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ToastType } from "../toaster/Toast";
import { ToastActionsContext } from "../toaster/ToastContexts";

// Will contain lines 50 - 135 of AuthenticationFormLayout.tsx

const OAuth = () => {
  const { displayToast } = useContext(ToastActionsContext);

  const displayInfoMessageWithDarkBackground = (message: string): void => {
    displayToast(
      ToastType.Info,
      message,
      3000,
      undefined,
      "text-white bg-primary"
    );
  };

  return (
    <>
      <div className="text-center mb-3">
        <button
          type="button"
          className="btn btn-link btn-floating mx-1"
          onClick={() =>
            displayInfoMessageWithDarkBackground(
              "Google registration is not implemented."
            )
          }
        >
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="googleTooltip">Google</Tooltip>}
          >
            <FontAwesomeIcon icon={["fab", "google"]} />
          </OverlayTrigger>
        </button>

        <button
          type="button"
          className="btn btn-link btn-floating mx-1"
          onClick={() =>
            displayInfoMessageWithDarkBackground(
              "Facebook registration is not implemented."
            )
          }
        >
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="facebookTooltip">Facebook</Tooltip>}
          >
            <FontAwesomeIcon icon={["fab", "facebook"]} />
          </OverlayTrigger>
        </button>

        <button
          type="button"
          className="btn btn-link btn-floating mx-1"
          onClick={() =>
            displayInfoMessageWithDarkBackground(
              "Twitter registration is not implemented."
            )
          }
        >
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="twitterTooltip">Twitter</Tooltip>}
          >
            <FontAwesomeIcon icon={["fab", "twitter"]} />
          </OverlayTrigger>
        </button>

        <button
          type="button"
          className="btn btn-link btn-floating mx-1"
          onClick={() =>
            displayInfoMessageWithDarkBackground(
              "LinkedIn registration is not implemented."
            )
          }
        >
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="linkedInTooltip">LinkedIn</Tooltip>}
          >
            <FontAwesomeIcon icon={["fab", "linkedin"]} />
          </OverlayTrigger>
        </button>

        <button
          type="button"
          className="btn btn-link btn-floating mx-1"
          onClick={() =>
            displayInfoMessageWithDarkBackground(
              "Github registration is not implemented."
            )
          }
        >
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="githubTooltip">GitHub</Tooltip>}
          >
            <FontAwesomeIcon icon={["fab", "github"]} />
          </OverlayTrigger>
        </button>
      </div>
    </>
  );
};

export default OAuth;
