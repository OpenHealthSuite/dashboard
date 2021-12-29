import * as fs from 'fs'
import * as envfile from 'envfile'
import * as yaml from 'js-yaml'


const cdkValues = JSON.parse(fs.readFileSync('./cdk.out/outputs.json', 'utf8'))['PaceMeScaffoldStack-Development'];

// This is to grab the old secret if it's not been re-rolled
if (fs.existsSync('../api/.env')){
    const oldvars = envfile.parse(fs.readFileSync('../api/.env', 'utf8'))
    if (oldvars.AWS_SECRET_ACCESS_KEY && cdkValues.ApiAwsAccessKey === oldvars.AWS_ACCESS_KEY_ID) {
        cdkValues.ApiAwsUserSecret = oldvars.AWS_SECRET_ACCESS_KEY
    }
}

const apiEnvVariables = '../api/.env.example'
let parsedApiEnvVariables = envfile.parse(fs.readFileSync(apiEnvVariables, 'utf8'));
parsedApiEnvVariables.COGNITO_USER_POOL_ID = cdkValues.CognitoPoolId
parsedApiEnvVariables.TRAINING_PLAN_TABLE = cdkValues.DynamoTrainingPlan
parsedApiEnvVariables.TRAINING_PLAN_ACTIVITY_TABLE = cdkValues.DynamoTrainingPlanActivity
parsedApiEnvVariables.AWS_ACCESS_KEY_ID = cdkValues.ApiAwsAccessKey
parsedApiEnvVariables.AWS_SECRET_ACCESS_KEY = cdkValues.ApiAwsSecretKey
fs.writeFileSync('../api/.env', envfile.stringify(parsedApiEnvVariables))

const apiManifestYaml = '../api/manifest.example.yml'
let parsedApiManifestYaml: any[] = yaml.loadAll(fs.readFileSync(apiManifestYaml, 'utf8'))
parsedApiManifestYaml[1].spec.containers[0].image = cdkValues.ECRApiRepository + ':latest'
parsedApiManifestYaml[1].spec.containers[0].env = parsedApiManifestYaml[1].spec.containers[0].env.map((envval: { name: string, value: string }) => {
    switch (envval.name) {
        case "COGNITO_USER_POOL_ID":
            envval.value = cdkValues.CognitoPoolId
            break;
        case "TRAINING_PLAN_TABLE":
            envval.value = cdkValues.DynamoTrainingPlan
            break;
        case "TRAINING_PLAN_ACTIVITY_TABLE":
            envval.value = cdkValues.DynamoTrainingPlanActivity
            break;
        case "AWS_ACCESS_KEY_ID":
            envval.value = cdkValues.ApiAwsAccessKey
            break;
        case "AWS_SECRET_ACCESS_KEY":
            envval.value = cdkValues.ApiAwsUserSecret
            break;
    }
    return envval
})
fs.writeFileSync('../api/manifest.yml', parsedApiManifestYaml.map(x => yaml.dump(x)).join('\n---\n'))

const webappEnvVariables = '../webapp/.env.example'
let parsedWebappEnvVariables = envfile.parse(fs.readFileSync(webappEnvVariables, 'utf8'));
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_ID = cdkValues.CognitoPoolId
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_CLIENTID = cdkValues.CognitoLocalWebappClientId
fs.writeFileSync('../webapp/.env', envfile.stringify(parsedWebappEnvVariables))