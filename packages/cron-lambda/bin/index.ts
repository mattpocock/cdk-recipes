#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CronLambdaRootStack } from "../lib";
import { AssetCode, Runtime } from "@aws-cdk/aws-lambda";

const app = new cdk.App();

new CronLambdaRootStack(app, "CronLambdaRootStack", {
  cronOptions: {
    day: "0",
  },
  lambdaOptions: {
    code: AssetCode.inline(
      `exports.handler = (req, res) => { res.send('Hello world!'); }`,
    ),
    handler: "index.handler",
    runtime: Runtime.NODEJS_10_X,
  },
  uniqueId: "uniqueId",
});
