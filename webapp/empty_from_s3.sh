export FRONTEND_BUCKET=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeFrontendStack-Development"].frontendBucketName')
export BUCKET_REGION=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeFrontendStack-Development"].frontendBucketRegion')

aws s3 rm s3://$FRONTEND_BUCKET --recursive --region $BUCKET_REGION