#!/bin/bash

npm run build \
&& sam build \
&& sam deploy --no-confirm-changeset
