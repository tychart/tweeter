import { AuthToken } from "tweeter-shared";
import { StoryService } from "../model.service/StatusItemService";
import { StatusItemPresenter, StatusItemView } from "./StatusItemPresenter";

export class PostStatusPresenter {
  private storyService: StoryService;

  public constructor(view: StatusItemView) {
    this.storyService = new StoryService();
  }
}
