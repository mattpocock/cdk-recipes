#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { S3HostBuildFolderRootStack } from "../lib/s3-host-build-folder-stack";

const app = new cdk.App();

new S3HostBuildFolderRootStack(app, "S3HostBuildFolderExampleStack", {
  buildFolder: "./example-build",
  websiteIndexDocument: "index.html",
  env: {
    region: "eu-west-1",
  },
});
