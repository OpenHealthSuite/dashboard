helm upgrade paceme ./helm \
  --namespace paceme \
  --create-namespace \
  --install \
  --atomic \
  --set "fitbit.clientId=$(credstash get paceme/fitbit-client-id)" \
  --set "fitbit.clientSecret=$(credstash get paceme/fitbit-client-secret)" \
  --set "api.postgrespw=$(credstash get paceme/postgrespw)" \
  --set "api.postgresconnectionstring=postgresql://paceme:$(credstash get paceme/postgrespw)@postgres.paceme.svc:5432/paceme"