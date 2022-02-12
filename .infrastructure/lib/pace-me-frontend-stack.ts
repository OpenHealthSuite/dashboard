import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { joinTruthyStrings } from '../utilities/stringjoiner';

interface PaceMeFrontendStackProps extends StackProps {
  stackPrefix: string | undefined
}

export class PaceMeFrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: PaceMeFrontendStackProps) {
    super(scope, id, props);

    const domainPrefix = joinTruthyStrings([props.stackPrefix, 'app'])
    const domainName = `${domainPrefix}.paceme.info`

    const frontendS3Bucket = new s3.Bucket(this, 'PaceMeWebApp', {
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../webapp/build')],
      destinationBucket: frontendS3Bucket
    })

    const frontendS3BucketOriginAccess = new OriginAccessIdentity(this, 'FrontendOriginAccess', {});
    frontendS3Bucket.grantRead(frontendS3BucketOriginAccess);

    const zone = route53.HostedZone.fromLookup(this, 'PaceMeZone', {
      domainName: 'paceme.info'
    });

    const certificate = new acm.Certificate(this, 'PaceMeAppCertificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const cfDist = new cloudfront.Distribution(this, 'PaceMeAppDistribution', {
      defaultBehavior: { 
          origin: new origins.S3Origin(frontendS3Bucket, {
              originAccessIdentity: frontendS3BucketOriginAccess
            }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html'
        }
      ],
      certificate: certificate,
      domainNames: [domainName]
    });

    const cName = new route53.CnameRecord(this, 'Frontend53', {
      zone: zone,
      recordName: domainPrefix,
      domainName: cfDist.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'frontendCloudfrontDistributionId', { value: cfDist.distributionId });
  }
}