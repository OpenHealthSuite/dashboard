#!/bin/bash

export REPOSITORY=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeScaffoldStack-Development"].ECRApiRepository')
export REPOSITORY_ROOT="$( cut -d '/' -f 1 <<< "$REPOSITORY" )"

kubectl create secret docker-registry awsregcred \
  --docker-server=$REPOSITORY_ROOT\
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region eu-west-2) \
  --namespace=paceme-api