import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";

interface Props {
  uniqueId: string;
  cronOptions: events.CronOptions;
  lambdaOptions: lambda.FunctionProps;
  ruleOptions?: Omit<events.RuleProps, "schedule">;
}

export class CronLambdaNestedStack extends cdk.NestedStack {
  rule: events.Rule;
  function: lambda.Function;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: Props & cdk.NestedStackProps,
  ) {
    super(scope, id, props);

    this.rule = new events.Rule(this, "ScheduleRule" + props.uniqueId, {
      ...props.ruleOptions,
      schedule: events.Schedule.cron(props.cronOptions),
    });

    this.function = new lambda.Function(
      this,
      `LambdaFunction` + props.uniqueId,
      props.lambdaOptions,
    );

    this.rule.addTarget(new targets.LambdaFunction(this.function));
  }
}

export class CronLambdaRootStack extends cdk.Stack {
  rule: events.Rule;
  function: lambda.Function;
  constructor(scope: cdk.Construct, id: string, props: Props & cdk.StackProps) {
    super(scope, id, props);
    const stack = new CronLambdaNestedStack(
      this,
      `${props.uniqueId}CronLambdaNestedStack`,
      props,
    );

    this.rule = stack.rule;
    this.function = stack.function;
  }
}
