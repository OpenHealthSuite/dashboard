import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'

export class PaceMeFrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const frontendS3Bucket = new s3.Bucket(this, 'PaceMeWebApp', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
      publicReadAccess: false
    })

    new cdk.CfnOutput(this, 'frontendBucketName', { value: frontendS3Bucket.bucketName });
    new cdk.CfnOutput(this, 'frontendBucketAddress', { value: frontendS3Bucket.bucketWebsiteDomainName });
    new cdk.CfnOutput(this, 'frontendBucketRegion', { value: props?.env?.region || 'us-east-1' });

    const zone = route53.HostedZone.fromLookup(this, 'PaceMeZone', {
      domainName: 'paceme.info'
    });

    const certificate = new acm.Certificate(this, 'PaceMeAppCertificate', {
      domainName: 'app-dev.paceme.info',
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const cfDist = new cloudfront.Distribution(this, 'PaceMeAppDistribution', {
      defaultBehavior: { origin: new origins.S3Origin(frontendS3Bucket) },
      certificate: certificate,
      domainNames: ['app-dev.paceme.info']
    });

    const cName = new route53.CnameRecord(this, 'Frontend53', {
      zone: zone,
      recordName: 'app-dev',
      domainName: cfDist.distributionDomainName,
    });

  }
}