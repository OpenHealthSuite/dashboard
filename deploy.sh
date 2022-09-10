helm upgrade paceme ./helm \
  --namespace paceme \
  --create-namespace \
  --install \
  --atomic \
  --set "oauth2.clientid=$(credstash get paceme/oauth2.clientid)" \
  --set "oauth2.secret=$(credstash get paceme/oauth2.secret)" \
  --set "oauth2.cookiesecret=$(credstash get paceme/oauth2.cookiesecret)" \
  --set "oauth2.oidcIssuerUrl=$(credstash get paceme/oauth2.oidcIssuerUrl)" \
  --set "oauth2.imageversion=v7.2.1" \
  --set "oauth2.tokenstyle=header" \
  --set "fitbit.clientId=$(credstash get paceme/fitbit-client-id)" \
  --set "fitbit.clientSecret=$(credstash get paceme/fitbit-client-secret)" \
  --set "api.postgrespw=$(credstash get paceme/postgrespw)" \
  --set "api.postgresconnectionstring=postgresql://paceme:$(credstash get paceme/postgrespw)@postgres.paceme.svc:5432/paceme" \
  --set "api.tag=v0.0.5"