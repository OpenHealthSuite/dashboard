# PaceMe.js - Run planning application, in javascript.


## Local testing notes (shamelesly copied)

Invoking function locally through local API Gateway

- Start DynamoDB Local in a Docker container. ```docker run -p 8000:8000 amazon/dynamodb-local```
- Create the DynamoDB table:
```aws dynamodb create-table --table-name SampleTable --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000```
    - Start the SAM local API. ```sam local start-api --env-vars src/test/resources/test_environment.json -p 3030```

If the previous command ran successfully you should now be able to hit the following local endpoint to invoke the functions rooted at http://localhost:3030/