# Note: This won't work in the real, need fresh fitbit client id/secret
# but it's enough to show the oauth2 issue

helm upgrade paceme-test ./helm \
  --namespace paceme-test \
  --create-namespace \
  --install \
  --atomic \
  --set "oauth2.clientid=$(credstash get paceme-test/oauth2.clientid)" \
  --set "oauth2.secret=$(credstash get paceme-test/oauth2.secret)" \
  --set "oauth2.cookiesecret=$(credstash get paceme/oauth2.cookiesecret)" \
  --set "oauth2.oidcIssuerUrl=$(credstash get paceme/oauth2.oidcIssuerUrl)" \
  --set "oauth2.imageversion=v7.3.0" \
  --set "oauth2.tokenstyle=header" \
  --set "fitbit.clientId=$(credstash get paceme/fitbit-client-id)" \
  --set "fitbit.clientSecret=$(credstash get paceme/fitbit-client-secret)" \
  --set "api.postgrespw=$(credstash get paceme/postgrespw)" \
  --set "api.postgresconnectionstring=postgresql://paceme:$(credstash get paceme/postgrespw)@postgres.paceme-test.svc:5432/paceme" \
  --set "api.tag=v0.0.3" \
  --set "hostname=app-test.paceme.info"