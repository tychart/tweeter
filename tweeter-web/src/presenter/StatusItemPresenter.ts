import { Status } from "tweeter-shared";
import { PagedItemPresenter } from "./PagedItemPresenter";
import { StatusService } from "../model.service/StatusService";

// export interface StatusItemView extends View {
//   addItems: (items: Status[]) => void;
// }

export abstract class StatusItemPresenter extends PagedItemPresenter<
  Status,
  StatusService
> {
  protected serviceFactory(): StatusService {
    return new StatusService();
  }
}
