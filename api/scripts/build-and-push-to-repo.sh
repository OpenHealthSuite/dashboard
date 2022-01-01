#!/bin/bash
# Expecting to be run from the root
export REPOSITORY=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeScaffoldStack"].ECRApiRepository')
# export ACCOUNTID=$(aws sts get-caller-identity | jq -r '.Account')
export REPOSITORY_ROOT="$( cut -d '/' -f 1 <<< "$REPOSITORY" )"
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin ${REPOSITORY_ROOT}
docker buildx build --platform linux/arm/v7,linux/arm64/v8,linux/amd64 -t "$REPOSITORY:latest" --push .