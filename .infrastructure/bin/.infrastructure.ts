#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PaceMeScaffoldStack } from '../lib/pace-me-scaffold-stack';
import { PaceMeFrontendStack } from '../lib/pace-me-frontend-stack';


const app = new cdk.App();
new PaceMeScaffoldStack(app, 'PaceMeScaffoldStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});

new PaceMeFrontendStack(app, 'PaceMeFrontendStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' }
});
