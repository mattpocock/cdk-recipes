#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { GithubAmplifyRootStack } from "../lib";

const app = new cdk.App();

new GithubAmplifyRootStack(app, "GithubAmplifyExampleStack", {
  branches: [
    {
      branch: "master",
    },
  ],
  repository: {
    // This resolves to a repo at https://github.com/mattpocock/some-repo
    owner: "mattpocock",
    name: "some-repo",
    oauthToken: cdk.SecretValue.secretsManager("my-github-auth-token"),
  },
  useSpaRewriteRule: true,
  env: {
    region: "eu-west-1",
  },
  uniqueId: "Example",
});
