import * as fs from 'fs'
import * as envfile from 'envfile'
import * as yaml from 'js-yaml'


const scaffoldCdkValues = JSON.parse(fs.readFileSync('./cdk.out/outputs.json', 'utf8'))['PaceMeScaffoldStack'];
const secretsValues = JSON.parse(fs.readFileSync('./secrets.json', 'utf8'));


const apiEnvVariables = '../api/.env.example'
let parsedApiEnvVariables = envfile.parse(fs.readFileSync(apiEnvVariables, 'utf8'));
parsedApiEnvVariables.COGNITO_USER_POOL_ID = scaffoldCdkValues.CognitoPoolId
parsedApiEnvVariables.USER_SERVICE_TOKEN_TABLE = scaffoldCdkValues.DynamoUserServiceToken
parsedApiEnvVariables.USER_SETTING_TABLE = scaffoldCdkValues.DynamoUserSetting
parsedApiEnvVariables.TRAINING_PLAN_TABLE = scaffoldCdkValues.DynamoTrainingPlan
parsedApiEnvVariables.TRAINING_PLAN_ACTIVITY_TABLE = scaffoldCdkValues.DynamoTrainingPlanActivity
parsedApiEnvVariables.SERVICE_CACHE_TABLE = scaffoldCdkValues.DynamoServiceCache
parsedApiEnvVariables.AWS_ACCESS_KEY_ID = scaffoldCdkValues.ApiAwsAccessKey
parsedApiEnvVariables.AWS_SECRET_ACCESS_KEY = scaffoldCdkValues.ApiAwsSecretKey
parsedApiEnvVariables.FITBIT_CLIENT_ID = secretsValues.fitbit.clientId
parsedApiEnvVariables.FITBIT_CLIENT_SECRET = secretsValues.fitbit.clientSecret
fs.writeFileSync('../api/.env', envfile.stringify(parsedApiEnvVariables))

const apiManifestYaml = '../api/manifest.example.yml'
let parsedApiManifestYaml: any[] = yaml.loadAll(fs.readFileSync(apiManifestYaml, 'utf8'))
parsedApiManifestYaml.find(x => x.kind === 'Deployment' && x.metadata.name === 'paceme-api').spec.template.spec.containers[0].image = scaffoldCdkValues.ECRApiRepository + ':latest'
parsedApiManifestYaml.find(x => x.kind === 'Deployment' && x.metadata.name === 'paceme-api').spec.template.spec.containers[0].env = parsedApiManifestYaml.find(x => x.kind === 'Deployment' && x.metadata.name === 'paceme-api').spec.template.spec.containers[0].env.map((envval: { name: string, value: string }) => {
    switch (envval.name) {
        case "COGNITO_USER_POOL_ID":
            envval.value = scaffoldCdkValues.CognitoPoolId
            break;
        case "SERVICE_CACHE_TABLE":
            envval.value = scaffoldCdkValues.DynamoServiceCache
            break;
        case "USER_SERVICE_TOKEN_TABLE":
            envval.value = scaffoldCdkValues.DynamoUserServiceToken
            break;
        case "USER_SETTING_TABLE":
            envval.value = scaffoldCdkValues.DynamoUserSetting
            break;
        case "TRAINING_PLAN_TABLE":
            envval.value = scaffoldCdkValues.DynamoTrainingPlan
            break;
        case "TRAINING_PLAN_ACTIVITY_TABLE":
            envval.value = scaffoldCdkValues.DynamoTrainingPlanActivity
            break;
        case "AWS_ACCESS_KEY_ID":
            envval.value = scaffoldCdkValues.ApiAwsAccessKey
            break;
        case "AWS_SECRET_ACCESS_KEY":
            envval.value = scaffoldCdkValues.ApiAwsSecretKey
            break;
        case "FITBIT_CLIENT_ID":
            envval.value = secretsValues.fitbit.clientId
            break;
        case "FITBIT_CLIENT_SECRET":
            envval.value = secretsValues.fitbit.clientSecret
            break;
    }
    return envval
})
fs.writeFileSync('../api/manifest.yml', parsedApiManifestYaml.map(x => yaml.dump(x)).join('\n---\n'))

const webappEnvVariables = '../webapp/.env.example'
let parsedWebappEnvVariables = envfile.parse(fs.readFileSync(webappEnvVariables, 'utf8'));
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_ID = scaffoldCdkValues.CognitoPoolId
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_CLIENTID = scaffoldCdkValues.CognitoLocalWebappClientId
fs.writeFileSync('../webapp/.env', envfile.stringify(parsedWebappEnvVariables))