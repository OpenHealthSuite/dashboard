#!/bin/bash

export REPOSITORY=$(credstash get paceme/ECRApiRepository)
export REPOSITORY_ROOT="$( cut -d '/' -f 1 <<< "$REPOSITORY" )"
kubectl create namespace paceme-api || true
kubectl delete secret awsregcred --namespace=paceme-api || true
kubectl create secret docker-registry awsregcred \
  --docker-server=$REPOSITORY_ROOT\
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region eu-west-2) \
  --namespace=paceme-api