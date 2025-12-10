import json
import requests

def send_post(url: str, payload: dict, headers: dict | None = None) -> requests.Response:
    """
    Send a POST request with a JSON body.

    Parameters
    ----------
    url : str
        Target API endpoint.
    payload : dict
        JSON body to send.
    headers : dict | None
        Optional additional request headers.

    Returns
    -------
    requests.Response
        The HTTP response object.
    """
    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)

    response = requests.post(url, data=json.dumps(payload), headers=default_headers)
    return response

def register_user(url, itter_suffix):
    register_body = {
        "userAlias": f"@loadtest{itter_suffix}",
        "firstName": f"GenericUser{itter_suffix}",
        "lastName": "Loadtesting",
        "password": "test",
        "imageStringBase64": "iVBORw0KGgoAAAABCAYAAAAfFcSJAAAACElEQVR",
        "imageFileExtension": ".png"
    }

    response = send_post(url, register_body)

    # print("Status:", response.status_code)
    # print("Response:", response.text)

    if (response.status_code == 200):
        if ("already exists" not in response.text):
            print(f"@loadtest{itter_suffix} was successfully registered")
        else:
            raise Exception(f"@loadtest{itter_suffix} already exists")
    else:
        print(f"@loadtest{itter_suffix} failed to register. Here is the response: {response}")
        raise Exception(f"@loadtest{itter_suffix} failed to register. Here is the response: {response}")

    # Safely parse JSON
    try:
        response_json = response.json()  # automatically parses JSON
        # print("Parsed JSON:", response_json)

        # Access fields safely
        # Example:
        # print(response_json["data"])
    except ValueError:
        print("Response was not valid JSON")

    return response_json

def follow_user(url, token, alias):
    follow_body = {
        "token": token,
        "user": {
            "alias": "@test",
            "firstName": "Test",
            "lastName": "Test",
            "imageUrl": "https://example.com"
        }
    }

    response = send_post(url, follow_body)

    if (response.status_code == 200):
        print(f"{alias} successfully followed @test")
    else:
        print(f"{alias} failed to follow @test. Here is the response: {response}")


if __name__ == "__main__":
    register_url = "https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd/user/register"
    login_url = "https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd/user/login"
    follow_url = "https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd/follow/follow"

    starting_suffix = 33
    ending_suffix = 34

    for i in range(starting_suffix, ending_suffix + 1):
        register_response_json = register_user(register_url, i)

        follow_user(
            follow_url, 
            register_response_json['token'], 
            register_response_json['user']['alias']
        )

        print("--------------------------------------------------------")

