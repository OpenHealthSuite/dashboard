#!/bin/bash
# Expecting to be run from the root
export REPOSITORY="leemartin77/paceme-webapp"
export VERSION="$(cat package.json | jq -r '.version')"
docker buildx build --platform linux/arm/v7,linux/arm64/v8,linux/amd64 \
  --build-arg REACT_APP_AWS_USER_POOL_ID="$(credstash get paceme/CognitoPoolId)" \
  --build-arg REACT_APP_AWS_USER_POOL_CLIENTID="$(credstash get paceme/CognitoLocalWebappClientId)" \
  -t "$REPOSITORY:latest" -t "$REPOSITORY:$VERSION" --push . 