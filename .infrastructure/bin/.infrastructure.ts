#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PaceMeScaffoldStack } from '../lib/pace-me-scaffold-stack';
import { joinTruthyStrings } from '../utilities/stringjoiner'

const STACK_ENVIRONMENT = process.env.CDK_ENVIRONMENT === "Production" ? undefined : "Development"
const STACK_PREFIX = process.env.CDK_ENVIRONMENT === "Production" ? undefined : process.env.CDK_PREFIX ?? "dev"

const app = new cdk.App();
new PaceMeScaffoldStack(app, joinTruthyStrings(['PaceMeScaffoldStack', STACK_ENVIRONMENT]), {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  stackPrefix: STACK_PREFIX
});
