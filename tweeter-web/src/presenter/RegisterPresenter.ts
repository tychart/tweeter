import { User, AuthToken } from "tweeter-shared";
import { AuthService } from "../model.service/AuthService";
import { Buffer } from "buffer";
import { Presenter, View } from "./Presenter";

export interface RegisterView extends View {
  displayErrorMessage: (message: string) => string;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (...args: any[]) => void;
}

export class RegisterPresenter extends Presenter<RegisterView> {
  private authService: AuthService;
  private _isLoading: boolean = false;
  private _imageBytes: Uint8Array = Buffer.from([]);
  private _imageFileExtension: string = "";
  private _imageUrl: string = "";

  public constructor(view: RegisterView) {
    super(view);
    this.authService = new AuthService();
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public get imageBytes(): Uint8Array {
    return this._imageBytes;
  }

  public get imageFileExtension(): string {
    return this._imageFileExtension;
  }

  public get imageUrl(): string {
    return this._imageUrl;
  }

  public set isLoading(value: boolean) {
    this._isLoading = value;
  }

  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ) {
    this.doFailureReportingOperation(
      async () => {
        this.isLoading = true;

        const [user, authToken] = await this.authService.register(
          firstName,
          lastName,
          alias,
          password,
          imageBytes,
          imageFileExtension
        );

        this.view.updateUserInfo(user, user, authToken, rememberMe);
        this.view.navigate(`/feed/${user.alias}`);
      },
      "register user",
      () => {
        this.isLoading = false;
      }
    );
  }

  public handleImageFile(file: File | undefined) {
    if (file) {
      this._imageUrl = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this._imageBytes = bytes;
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this._imageFileExtension = fileExtension;
      }
    } else {
      this._imageUrl = "";
      this._imageBytes = new Uint8Array();
    }
  }

  public getFileExtension(file: File): string | undefined {
    return file.name.split(".").pop();
  }
}
