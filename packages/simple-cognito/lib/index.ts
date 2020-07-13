import * as cognito from "@aws-cdk/aws-cognito";
import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";

interface Props extends cdk.NestedStackProps {
  uniqueId: string;
  userPoolProps?: cognito.UserPoolProps;
  allowUnauthenticatedIdentities: boolean;
  identityPoolProps?: Omit<
    cognito.CfnIdentityPoolProps,
    "allowUnauthenticatedIdentities" | "cognitoIdentityProviders"
  >;
  userPoolClientProps?: cognito.UserPoolClientProps;
}

export class SimpleCognitoNestedStack extends cdk.NestedStack {
  userPool: cognito.UserPool;
  identityPool: cognito.CfnIdentityPool;
  appClient: cognito.UserPoolClient;
  authenticatedRole: iam.Role;
  unauthenticatedRole: iam.Role;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(
      this,
      `UserPool${props.uniqueId}`,
      props.userPoolProps,
    );

    this.appClient = this.userPool.addClient(
      `AppClient${props.uniqueId}`,
      props.userPoolClientProps,
    );

    this.identityPool = new cognito.CfnIdentityPool(
      this,
      `IdentityProvider${props.uniqueId}`,
      {
        ...props.identityPoolProps,
        allowUnauthenticatedIdentities: props.allowUnauthenticatedIdentities,
        cognitoIdentityProviders: [
          {
            clientId: this.appClient.userPoolClientId,
            providerName: this.userPool.userPoolProviderName,
          },
        ],
      },
    );

    this.authenticatedRole = new iam.Role(
      this,
      `CognitoDefaultAuthenticatedRole${props.uniqueId}`,
      {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity",
        ),
      },
    );
    this.authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["cognito-sync:*", "cognito-identity:*"],
        resources: ["*"],
      }),
    );

    this.unauthenticatedRole = new iam.Role(
      this,
      `CognitoDefaultUnauthenticatedRole${props.uniqueId}`,
      {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity",
        ),
      },
    );
    this.unauthenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["cognito-sync:*"],
        resources: ["*"],
      }),
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      `DefaultValidRole${props.uniqueId}`,
      {
        identityPoolId: this.identityPool.ref,
        roles: {
          unauthenticated: this.unauthenticatedRole.roleArn,
          authenticated: this.authenticatedRole.roleArn,
        },
      },
    );
  }
}

export class SimpleCognitoRootStack extends cdk.Stack {
  userPool: cognito.UserPool;
  identityPool: cognito.CfnIdentityPool;
  appClient: cognito.UserPoolClient;
  authenticatedRole: iam.Role;
  unauthenticatedRole: iam.Role;
  constructor(scope: cdk.Construct, id: string, props: Props & cdk.StackProps) {
    super(scope, id, props);
    const stack = new SimpleCognitoNestedStack(
      this,
      `${props.uniqueId}SimpleCognitoStack`,
      props,
    );

    this.userPool = stack.userPool;
    this.identityPool = stack.identityPool;
    this.appClient = stack.appClient;
    this.authenticatedRole = stack.authenticatedRole;
    this.unauthenticatedRole = stack.unauthenticatedRole;
  }
}
