import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dyn from 'aws-cdk-lib/aws-dynamodb'
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as iam from 'aws-cdk-lib/aws-iam'

interface PaceMeScaffoldStackProps extends StackProps {
  stackPrefix: string | undefined
}

export class PaceMeScaffoldStack extends Stack {
  constructor(scope: Construct, id: string, props: PaceMeScaffoldStackProps) {
    super(scope, id, props);

    const dynamoTables : { name: string, partKey: string, sortKey: string }[] = [ 
      {
        name: 'UserSetting',
        partKey: 'userId',
        sortKey: 'settingId'
      },
      {
        name: 'UserServiceToken',
        partKey: 'userId',
        sortKey: 'serviceId'
      }
    ]

    const createdTables = dynamoTables.map(dt => {
      return {
        name: dt.name,
        table: new dyn.Table(this, dt.name, {
          partitionKey: { name: dt.partKey, type: dyn.AttributeType.STRING },
          sortKey: { name: dt.sortKey, type: dyn.AttributeType.STRING },
          billingMode: dyn.BillingMode.PAY_PER_REQUEST,
          removalPolicy: RemovalPolicy.DESTROY
        })
      }
    })

    createdTables.map(ct => new cdk.CfnOutput(
      this, 
      `Dynamo-${ct.name}`, 
      {
        value: ct.table.tableName,
        description:`Name of the ${ct.name} dynamo table`,
        exportName: `dynamo${ct.name}`
      }
      )
    )

    const userPool = new cognito.UserPool(this, 'PaceMeUserpool', {
      userPoolName: id,
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for PaceMe!',
        emailBody: 'Thanks for signing up to PaceMe! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: {
        username: false,
        email: true
      },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
    });

    const localClient = userPool.addClient('paceme-webapp-local-client', {
      userPoolClientName: 'paceme-webapp-local',
      generateSecret: false,
      authFlows: {
        userPassword: true
      }
    });

    const awsApiUser = new iam.User(this, 'ApiUser', { })

    createdTables.map(x => x.table.grantFullAccess(awsApiUser))

    const accessKey = new iam.CfnAccessKey(this, 'PaceMeApiAWSAccessKey', {
      userName: awsApiUser.userName
    });

    new cdk.CfnOutput(this, 'ApiAwsAccessKey', { value: accessKey.ref });
    new cdk.CfnOutput(this, 'ApiAwsSecretKey', { value: accessKey.attrSecretAccessKey });

    new cdk.CfnOutput(
      this, 
      `Cognito-PoolId`, 
      {
        value: userPool.userPoolId,
        description:`Cognito UserPool Id`,
        exportName: `cognitoUserPoolId`
      }
    )

    new cdk.CfnOutput(
      this, 
      `Cognito-LocalWebappClientId`, 
      {
        value: localClient.userPoolClientId,
        description:`Cognito Local Client Webapp Id`,
        exportName: `cognitoLocalWebappClient`
      }
    )
  }
}