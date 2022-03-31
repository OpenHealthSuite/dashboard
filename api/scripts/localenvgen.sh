echo "FITBIT_CLIENT_ID=\"$(credstash get paceme-local/fitbit-client-id)\"" > .env
echo "FITBIT_CLIENT_SECRET=\"$(credstash get paceme-local/fitbit-client-secret)\"" >> .env
echo "COGNITO_USER_POOL_ID=\"$(credstash get paceme/CognitoPoolId)\"" >> .env