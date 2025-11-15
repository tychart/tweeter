# Tweeter-Web

A starter project for the Tweeter Web application.

## Setting Up the Project

1. cd into the project root folder
1. Run 'npm install'
1. cd into the tweeter-shared folder
1. Run 'npm install'
1. Run 'npm run build'
1. cd into the tweeter-web folder
1. Run 'npm install'
1. Run 'npm run build'

**Note:** VS Code seems to have a bug. After doing this, you should be able to run the project but code editors report that they can't see the 'tweeter-shared' module. Restarting VS Code fixes the problem. You will likely need to restart VS Code every time you compile or build the 'tweeter-shared' module.

**Note:** If you are using Windows, make sure to use a Git Bash terminal instead of Windows Powershell. Otherwise, the scripts won't run properly in tweeter-shared and it will cause errors when building tweeter-web.

## Rebuilding the Project

Rebuild either module of the project (tweeter-shared or tweeter-web) by running 'npm run build' after making any code or configuration changes in the module. The 'tweeter-web' module is dependent on 'tweeter-shared', so if you change 'tweeter-shared' you will also need to rebuild 'tweeter-web'. After rebuilding 'tweeter-shared' you will likely need to restart VS Code (see note above under 'Setting Up the Project').

## Running the Project

Run the project by running 'npm start' from within the 'tweeter-web' folder.

## Testing Notes

To curl the new endpoint:

```
curl -X POST --data-binary @/home/tychart/projects/tweeter/tweeter-server/test/manualTest/LoginRequest.json https://sn17mfphg5.execute-api.us-west-2.amazonaws.com/prd/user/login
```

To deploy the template.yml using SAM:

```
tychart@ubudesk(ubu25.04) ~/projects/tweeter/tweeter-server $ sam build && sam deploy --no-confirm-changeset
```

To hard copy over the folder into tweeter-server to avoid the error with symbolic links:

```
tychart@ubudesk(ubu25.04) ~/projects/tweeter/tweeter-server/layer/nodejs/node_modules $ rm -r tweeter-shared && cp -r ../../../../tweeter-shared/ .
```

## Using Unit or Integration Tests

### All tests

> Run `npm test` in `./tweeter-web` to test all of the tests in the `./tweeter-web/tests` folder.

### Specific Test Files

> Run `npm test -- test/model/network/serverFacade.test.ts` inside of `./tweeter-web` to run just one test file
