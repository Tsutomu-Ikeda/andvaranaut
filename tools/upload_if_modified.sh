#!/bin/bash

TARGET_FILE=$1

TARGET_FILE_HASH=$(openssl md5 frontend/dist/$TARGET_FILE | awk '{print $2}')
UPLOADED_FILE_HASH=$(aws s3api head-object --bucket andvaranaut-frontend --key $TARGET_FILE | jq -r ".ETag" | tr -d '"')

if [ "$TARGET_FILE_HASH" != "$UPLOADED_FILE_HASH" ]; then
  aws s3 cp frontend/dist/$TARGET_FILE s3://andvaranaut-frontend/$TARGET_FILE
fi
