#!/bin/bash
cat ./cdk.out/outputs.json | jq -r '.PaceMeScaffoldStack | keys[]' | 
while IFS= read -r key; do
    # TODO: This should respect different environment stacks in the future
    credstash put -a "paceme/$key" $(cat ./cdk.out/outputs.json | jq -r ".PaceMeScaffoldStack.$key") 
done