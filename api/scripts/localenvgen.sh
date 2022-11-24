echo "FITBIT_CLIENT_ID=\"$(credstash get paceme-local/fitbit-client-id)\"" > .env
echo "FITBIT_CLIENT_SECRET=\"$(credstash get paceme-local/fitbit-client-secret)\"" >> .env
echo "DEV_USER_ID=\"SomeUserId\"" >> .env
echo ""