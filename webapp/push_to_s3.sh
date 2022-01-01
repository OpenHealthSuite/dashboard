export FRONTEND_BUCKET=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeFrontendStack"].frontendBucketName')
export BUCKET_REGION=$(cat ../.infrastructure/cdk.out/outputs.json | jq -r '.["PaceMeFrontendStack"].frontendBucketRegion')

aws s3 cp build s3://$FRONTEND_BUCKET/ --recursive --region $BUCKET_REGION