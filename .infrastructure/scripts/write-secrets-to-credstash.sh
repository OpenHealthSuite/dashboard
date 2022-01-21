#!/bin/bash
cat ./cdk.out/outputs.json | jq -r '.PaceMeScaffoldStack | keys[]' | 
while IFS= read -r key; do
    credstash put -a "paceme/$key" $(cat ./cdk.out/outputs.json | jq -r ".PaceMeScaffoldStack.$key") 
done