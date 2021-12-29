export FRONTEND_BUCKET=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeScaffoldStack-Development"].frontendBucketName')

aws s3 rm s3://$FRONTEND_BUCKET --recursive