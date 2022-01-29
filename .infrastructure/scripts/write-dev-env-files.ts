import * as fs from 'fs'
import * as envfile from 'envfile'
import Credstash = require('nodecredstash')

const scaffoldCdkValues = JSON.parse(fs.readFileSync('./cdk.out/outputs.json', 'utf8'))['PaceMeScaffoldStack'];

const credstash = Credstash({ awsOpts: { region: 'eu-west-2' }})

const apiVars = async () => {
    const apiEnvVariables = '../api/.env.example'
    let parsedApiEnvVariables = envfile.parse(fs.readFileSync(apiEnvVariables, 'utf8'));
    parsedApiEnvVariables.COGNITO_USER_POOL_ID = scaffoldCdkValues.CognitoPoolId
    parsedApiEnvVariables.USER_SERVICE_TOKEN_TABLE = scaffoldCdkValues.DynamoUserServiceToken
    parsedApiEnvVariables.USER_SETTING_TABLE = scaffoldCdkValues.DynamoUserSetting
    parsedApiEnvVariables.TRAINING_PLAN_TABLE = scaffoldCdkValues.DynamoTrainingPlan
    parsedApiEnvVariables.TRAINING_PLAN_ACTIVITY_TABLE = scaffoldCdkValues.DynamoTrainingPlanActivity
    parsedApiEnvVariables.AWS_ACCESS_KEY_ID = scaffoldCdkValues.ApiAwsAccessKey
    parsedApiEnvVariables.AWS_SECRET_ACCESS_KEY = scaffoldCdkValues.ApiAwsSecretKey
    parsedApiEnvVariables.FITBIT_CLIENT_ID = await credstash.getSecret({ name: 'paceme/fitbit-client-id' })
    parsedApiEnvVariables.FITBIT_CLIENT_SECRET = await credstash.getSecret({ name: 'paceme/fitbit-client-secret' })
    fs.writeFileSync('../api/.env', envfile.stringify(parsedApiEnvVariables))
}

apiVars()

const webappEnvVariables = '../webapp/.env.example'
let parsedWebappEnvVariables = envfile.parse(fs.readFileSync(webappEnvVariables, 'utf8'));
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_ID = scaffoldCdkValues.CognitoPoolId
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_CLIENTID = scaffoldCdkValues.CognitoLocalWebappClientId
fs.writeFileSync('../webapp/.env', envfile.stringify(parsedWebappEnvVariables))