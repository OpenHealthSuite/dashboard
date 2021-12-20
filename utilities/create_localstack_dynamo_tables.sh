aws --endpoint-url=http://localhost:4566 dynamodb create-table \
--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=id,AttributeType=S \
--table-name TrainingPlan \
--key-schema AttributeName=userId,KeyType=HASH AttributeName=id,KeyType=RANGE \
--billing-mode PAY_PER_REQUEST

aws --endpoint-url=http://localhost:4566 dynamodb create-table \
--attribute-definitions AttributeName=trainingPlanId,AttributeType=S AttributeName=id,AttributeType=S \
--table-name TrainingPlanActivity \
--key-schema AttributeName=trainingPlanId,KeyType=HASH AttributeName=id,KeyType=RANGE \
--billing-mode PAY_PER_REQUEST