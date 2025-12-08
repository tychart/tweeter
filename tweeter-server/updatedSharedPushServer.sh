#!/bin/bash
cd /home/tychart/tweeter/tweeter-shared \
&& npm run build

rm -r /home/tychart/projects/tweeter/tweeter-server/node_modules/tweeter-shared
cp -r /home/tychart/projects/tweeter/tweeter-shared/ /home/tychart/projects/tweeter/tweeter-server/node_modules/


rm -r /home/tychart/projects/tweeter/tweeter-server/layer/nodejs/node_modules/
cp -r /home/tychart/projects/tweeter/tweeter-server/node_modules/ /home/tychart/projects/tweeter/tweeter-server/layer/nodejs/


cd /home/tychart/projects/tweeter/tweeter-server/

npm run build \
&& sam build \
&& sam deploy --no-confirm-changeset