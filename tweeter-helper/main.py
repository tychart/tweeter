import json
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed


class UserAlreadyExistsError(Exception):
    pass


class ApiError(Exception):
    pass


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

def register_user(url, suffix):
    register_body = {
        "userAlias": f"@loadtest{suffix}",
        "firstName": f"GenericUser{suffix}",
        "lastName": "Loadtesting",
        "password": "test",
        "imageStringBase64": "iVBORw0KGgoAAAABCAYAAAAfFcSJAAAACElEQVR",
        "imageFileExtension": ".png"
    }

    response = send_post(url, register_body)

    if response.status_code != 200:
        raise ApiError(
            f"register {suffix}: HTTP {response.status_code}: {response.text}"
        )
    
    # Check for "already exists" and signal that via a specific exception
    if "already exists" in response.text:
        raise UserAlreadyExistsError(f"@loadtest{suffix} already exists")

    # Safely parse JSON
    try:
        data = response.json()
    except ValueError:
        raise ApiError(f"register {suffix}: response is not valid JSON: {response.text}")

    return data  # must contain token + user


def login_user(url, suffix):
    login_body = {
        "userAlias": f"@loadtest{suffix}",
        "password": "test",
    }

    response = send_post(url, login_body)

    # print("Status:", response.status_code)
    # print("Response:", response.text)

    if response.status_code != 200:
        raise ApiError(
            f"login {suffix}: HTTP {response.status_code}: {response.text}"
        )

    # Safely parse JSON
    try:
        data = response.json()
    except ValueError:
        raise ApiError(f"login {suffix}: response is not valid JSON: {response.text}")

    return data  # must contain token + user


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

    if response.status_code != 200:
        raise ApiError(
            f"follow {alias}: HTTP {response.status_code}: {response.text}"
        )
    
    # Safely parse JSON
    try:
        data = response.json()
    except ValueError:
        raise ApiError(f"follow {suffix}: response is not valid JSON: {response.text}")

    return data

def worker(suffix, register_url, login_url, follow_url):
    register_success = True
    
    # 1. Try to register
    try:
        reg = register_user(register_url, suffix)
    except UserAlreadyExistsError:
        # 2. If user already exists (e.g., from a previous run), just log in
        reg = login_user(login_url, suffix)
        register_success = False
    
    # Any other ApiError will bubble out and be reported by the main loop

    # 3. Always try to follow
    try:
        data = follow_user(
            follow_url,
            reg["token"],
            reg["user"]["alias"]
        )
        if (not register_success and data['success']):
            print(f"User {reg["user"]["alias"]} already existed, but just now followed @test")
    except KeyError as e:
        print(f"Key Error: {str(e)}, this is the value of reg: {reg}")

    return suffix



if __name__ == "__main__":
    register_url = "https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd/user/register"
    login_url = "https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd/user/login"
    follow_url = "https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd/follow/follow"

    starting_suffix = 10000
    ending_suffix = 11000
    threads = 7  # adjust based on API limits


    # for i in range(starting_suffix, ending_suffix + 1):
    #     register_response_json = register_user(register_url, i)

    #     follow_user(
    #         follow_url, 
    #         register_response_json['token'], 
    #         register_response_json['user']['alias']
    #     )

    with ThreadPoolExecutor(max_workers=threads) as executor:
        futures = [
            executor.submit(worker, i, register_url, login_url, follow_url)
            for i in range(starting_suffix, ending_suffix + 1)
        ]

        for f in as_completed(futures):
            try:
                suffix = f.result()
                print(f"Completed: {suffix}")
            except Exception as e:
                print("Exception caught in outer loop:", e)
                # raise e


        

