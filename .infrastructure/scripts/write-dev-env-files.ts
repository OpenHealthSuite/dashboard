import * as fs from 'fs'
import * as envfile from 'envfile'
import * as yaml from 'js-yaml'


const scaffoldCdkValues = JSON.parse(fs.readFileSync('./cdk.out/outputs.json', 'utf8'))['PaceMeScaffoldStack-Development'];

// This is to grab the old secret if it's not been re-rolled
if (fs.existsSync('../api/.env')){
    const oldvars = envfile.parse(fs.readFileSync('../api/.env', 'utf8'))
    if (oldvars.AWS_SECRET_ACCESS_KEY && scaffoldCdkValues.ApiAwsAccessKey === oldvars.AWS_ACCESS_KEY_ID) {
        scaffoldCdkValues.ApiAwsUserSecret = oldvars.AWS_SECRET_ACCESS_KEY
    }
}

const apiEnvVariables = '../api/.env.example'
let parsedApiEnvVariables = envfile.parse(fs.readFileSync(apiEnvVariables, 'utf8'));
parsedApiEnvVariables.COGNITO_USER_POOL_ID = scaffoldCdkValues.CognitoPoolId
parsedApiEnvVariables.TRAINING_PLAN_TABLE = scaffoldCdkValues.DynamoTrainingPlan
parsedApiEnvVariables.TRAINING_PLAN_ACTIVITY_TABLE = scaffoldCdkValues.DynamoTrainingPlanActivity
parsedApiEnvVariables.AWS_ACCESS_KEY_ID = scaffoldCdkValues.ApiAwsAccessKey
parsedApiEnvVariables.AWS_SECRET_ACCESS_KEY = scaffoldCdkValues.ApiAwsSecretKey
fs.writeFileSync('../api/.env', envfile.stringify(parsedApiEnvVariables))

const apiManifestYaml = '../api/manifest.example.yml'
let parsedApiManifestYaml: any[] = yaml.loadAll(fs.readFileSync(apiManifestYaml, 'utf8'))
parsedApiManifestYaml.find(x => x.kind === 'Pod' && x.metadata.name === 'paceme-api').spec.containers[0].image = scaffoldCdkValues.ECRApiRepository + ':latest'
parsedApiManifestYaml.find(x => x.kind === 'Pod' && x.metadata.name === 'paceme-api').spec.containers[0].env = parsedApiManifestYaml.find(x => x.kind === 'Pod' && x.metadata.name === 'paceme-api').spec.containers[0].env.map((envval: { name: string, value: string }) => {
    switch (envval.name) {
        case "COGNITO_USER_POOL_ID":
            envval.value = scaffoldCdkValues.CognitoPoolId
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
            envval.value = scaffoldCdkValues.ApiAwsUserSecret
            break;
    }
    return envval
})

// parsedApiManifestYaml.find(x => x.kind === 'Issuer' && x.metadata.name === 'letsencrypt-prod').spec
//     .acme.solvers[0].dns01.route53.accessKeyID = cdkValues.ApiAwsAccessKey

// parsedApiManifestYaml.find(x => x.kind === 'Secret' && x.metadata.name === 'prod-route53-credentials-secret')
//     .data['secret-access-key'] = cdkValues.ApiAwsUserSecret
fs.writeFileSync('../api/manifest.yml', parsedApiManifestYaml.map(x => yaml.dump(x)).join('\n---\n'))

const webappEnvVariables = '../webapp/.env.example'
let parsedWebappEnvVariables = envfile.parse(fs.readFileSync(webappEnvVariables, 'utf8'));
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_ID = scaffoldCdkValues.CognitoPoolId
parsedWebappEnvVariables.REACT_APP_AWS_USER_POOL_CLIENTID = scaffoldCdkValues.CognitoLocalWebappClientId
fs.writeFileSync('../webapp/.env', envfile.stringify(parsedWebappEnvVariables))