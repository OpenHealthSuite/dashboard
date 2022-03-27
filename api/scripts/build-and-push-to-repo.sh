#!/bin/bash
# Expecting to be run from the root
export REPOSITORY="leemartin77/paceme-api"
export VERSION="$(cat package.json | jq -r '.version')"
docker buildx build --platform linux/arm/v7,linux/arm64/v8,linux/amd64 -t "$REPOSITORY:latest" -t "$REPOSITORY:$VERSION" --push .