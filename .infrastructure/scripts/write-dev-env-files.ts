import * as fs from 'fs'
import * as envfile from 'envfile'

const cdkValues = JSON.parse(fs.readFileSync('./cdk.out/outputs.json', 'utf8'))['PaceMeScaffoldStack-Development'];

const apiEnvVariables = '../api/.env.example'
let parsedApiEnvVariables = envfile.parse(fs.readFileSync(apiEnvVariables, 'utf8'));
parsedApiEnvVariables.COGNITO_USER_POOL_ID = cdkValues.CognitoPoolId
parsedApiEnvVariables.TRAINING_PLAN_TABLE = cdkValues.DynamoTrainingPlan
parsedApiEnvVariables.TRAINING_PLAN_ACTIVITY_TABLE = cdkValues.DynamoTrainingPlanActivity
fs.writeFileSync('../api/.env', envfile.stringify(parsedApiEnvVariables))


const webappEnvVariables = '../webapp/.env.example'
let parsedWebappEnvVariables = envfile.parse(fs.readFileSync(webappEnvVariables, 'utf8'));
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_ID = cdkValues.CognitoPoolId
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_CLIENTID = cdkValues.CognitoLocalWebappClientId
fs.writeFileSync('../webapp/.env', envfile.stringify(parsedWebappEnvVariables))