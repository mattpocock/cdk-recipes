import * as cdk from "@aws-cdk/core";
import * as amplify from "@aws-cdk/aws-amplify";

interface Props {
  repository: {
    owner: string;
    name: string;
    oauthToken: cdk.SecretValue;
  };
  uniqueId: string;
  branches: {
    domain?: string;
    branch: string;
    branchProps?: Omit<amplify.BranchOptions, "environment">;
    environmentVariables?: {};
  }[];
  useSpaRewriteRule?: boolean;
}

export class GithubAmplifyNestedStack extends cdk.NestedStack {
  app: amplify.App;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: Props & cdk.NestedStackProps,
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.app = new amplify.App(this, props.uniqueId + "AmplifyHosting", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: props.repository.owner,
        repository: props.repository.name,
        oauthToken: props.repository.oauthToken,
      }),
    });

    if (props.useSpaRewriteRule) {
      this.app.addCustomRule({
        source:
          "</^((?!.(css|gif|ico|jpg|js|json|png|txt|svg|woff|ttf)$).)*$/>",
        target: "/index.html",
        status: amplify.RedirectStatus.REWRITE,
      });
    }

    props.branches.forEach((branch) => {
      const amplifyBranch = this.app.addBranch(branch.branch, {
        ...branch.branchProps,
        environmentVariables: branch.environmentVariables,
      });

      if (branch.domain) {
        const domain = this.app.addDomain(branch.domain);
        domain.mapRoot(amplifyBranch);
      }
    });
  }
}

export class GithubAmplifyRootStack extends cdk.Stack {
  app: amplify.App;
  constructor(scope: cdk.Construct, id: string, props: Props & cdk.StackProps) {
    super(scope, id, props);
    const stack = new GithubAmplifyNestedStack(
      this,
      `${props.uniqueId}S3HostBuildFolderStack`,
      props,
    );

    this.app = stack.app;
  }
}
