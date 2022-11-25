PGPWD=$(kubectl get secret/postgres-service -n service -o jsonpath="{.data.postgrespw}" | base64 --decode)

helm upgrade paceme ./helm \
  --namespace paceme \
  --create-namespace \
  --install \
  --atomic \
  --set "fitbit.clientId=$(credstash get paceme/fitbit-client-id)" \
  --set "fitbit.clientSecret=$(credstash get paceme/fitbit-client-secret)"