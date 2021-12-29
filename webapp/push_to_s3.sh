export FRONTEND_BUCKET=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeScaffoldStack-Development"].frontendBucketName')

aws s3 cp build s3://$FRONTEND_BUCKET/ --recursive