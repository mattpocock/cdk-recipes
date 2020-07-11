import * as cdk from "@aws-cdk/core";

import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";

interface Props {
  websiteIndexDocument: string;
  buildFolder: string;
  websiteErrorDocument?: string;
  bucketProps?: Omit<s3.BucketProps, keyof Props>;
  deploymentProps?: Omit<
    s3Deploy.BucketDeploymentProps,
    "sources" | "destinationBucket"
  >;
}

export class S3HostBuildFolderNestedStack extends cdk.NestedStack {
  bucket: s3.Bucket;
  deployment: s3Deploy.BucketDeployment;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: Props & cdk.NestedStackProps,
  ) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, `HostingBucket`, {
      publicReadAccess: true,
      ...props.bucketProps,
      websiteIndexDocument: props.websiteIndexDocument,
      websiteErrorDocument: props.websiteErrorDocument,
    });

    this.deployment = new s3Deploy.BucketDeployment(this, `BucketDeployment`, {
      ...props.deploymentProps,
      destinationBucket: this.bucket,
      sources: [s3Deploy.Source.asset(props.buildFolder)],
    });

    new cdk.CfnOutput(this, "BucketWebsiteURL", {
      value: this.bucket.bucketWebsiteUrl,
      description: "The public URL of the hosted website",
      exportName: "BucketWebsiteUrl",
    });
  }
}

export class S3HostBuildFolderRootStack extends cdk.Stack {
  bucket: s3.Bucket;
  deployment: s3Deploy.BucketDeployment;
  constructor(scope: cdk.Construct, id: string, props: Props & cdk.StackProps) {
    super(scope, id, props);
    const stack = new S3HostBuildFolderNestedStack(
      this,
      `S3HostBuildFolderStack`,
      props,
    );

    this.bucket = stack.bucket;
    this.deployment = stack.deployment;
  }
}
