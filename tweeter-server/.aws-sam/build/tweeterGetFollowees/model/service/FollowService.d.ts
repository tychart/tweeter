import { UserDto } from "tweeter-shared";
import { Service } from "./Service";
export declare class FollowService implements Service {
    loadMoreFollowees(token: string, userAlias: string, pageSize: number, lastItem: UserDto | null): Promise<[UserDto[], boolean]>;
    loadMoreFollowers(token: string, userAlias: string, pageSize: number, lastItem: UserDto | null): Promise<[UserDto[], boolean]>;
    private getFakeData;
}
//# sourceMappingURL=FollowService.d.ts.map