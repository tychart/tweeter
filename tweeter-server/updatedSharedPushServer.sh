#!/bin/bash
cd ../tweeter-shared \
&& npm run build

rm -r /home/tychart/projects/tweeter/tweeter-server/node_modules/tweeter-shared; cp -r /home/tychart/projects/tweeter/tweeter-shared/ /home/tychart/projects/tweeter/tweeter-server/node_modules/

cd ../tweeter-server

npm run build \
&& sam build \
&& sam deploy --no-confirm-changeset