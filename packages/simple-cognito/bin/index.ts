#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { SimpleCognitoRootStack } from "../lib";

const app = new cdk.App();

new SimpleCognitoRootStack(app, "SimpleCognitoStack", {
  allowUnauthenticatedIdentities: false,
  uniqueId: "CognitoStack",
});
