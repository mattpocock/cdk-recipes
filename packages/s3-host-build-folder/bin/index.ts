#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { S3HostBuildFolderRootStack } from "../lib";

const app = new cdk.App();

new S3HostBuildFolderRootStack(app, "S3HostBuildFolderExampleStack", {
  buildFolder: "./example-build",
  websiteIndexDocument: "index.html",
  env: {
    region: "eu-west-1",
  },
  uniqueId: "Example",
});
