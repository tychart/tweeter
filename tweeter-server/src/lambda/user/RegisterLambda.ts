import {
  AuthToken,
  RegisterRequest,
  LoginResponse,
  UserDto,
} from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: RegisterRequest
): Promise<LoginResponse> => {
  // Validate before calling service to
  // make sure the user passed in the right thing
  validateRegisterRequest(request);

  const userService = new UserService();

  const [retrievedUser, authToken]: [UserDto | null, AuthToken | null] =
    await userService.register(
      request.firstName,
      request.lastName,
      request.userAlias,
      request.password,
      request.imageStringBase64,
      request.imageFileExtension
    );

  if (retrievedUser === null || authToken === null) {
    return {
      success: false,
      message:
        "There was a server error where the recently registered user or recently generated authtoken were null",
      user: retrievedUser,
      token: null,
      tokenTimestamp: null,
    };
  }

  return {
    success: true,
    message: null,
    user: retrievedUser,
    token: authToken.token,
    tokenTimestamp: authToken.timestamp,
  };
};

function validateRegisterRequest(request: RegisterRequest): void {
  const requiredFields: (keyof RegisterRequest)[] = [
    "firstName",
    "lastName",
    "userAlias",
    "password",
    "imageStringBase64",
    "imageFileExtension",
  ];

  for (const field of requiredFields) {
    if (typeof request[field] !== "string") {
      console.log(
        "Error occured in RegisterRequest validation, value of Register is: ",
        request
      );
      throw new Error(`${String(field)} must be a string`);
    }
    if (!request[field] || request[field].trim() === "") {
      throw new Error(`${String(field)} is required and cannot be empty`);
    }
  }
}
