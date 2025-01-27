import { ScheduledHandler } from "aws-lambda";
import { EC2 } from "aws-sdk";

export const handler: ScheduledHandler = async (event) => {
  const ec2 = new EC2({ region: event.region });

  const instanceId = process.env.EC2_INSTANCE_ID;

  if (!instanceId) {
    throw new Error("EC2_INSTANCE_ID is not defined");
  }

  // check if instance is running. If not, start it
  const instanceStatus = await ec2.describeInstanceStatus({
    InstanceIds: [instanceId],
  }).promise();

  if (instanceStatus?.InstanceStatuses && instanceStatus?.InstanceStatuses[0]?.InstanceState?.Name === "running") {
    console.log("Instance is already running");
    return;
  }

  const result = await ec2.startInstances({ InstanceIds: [instanceId] }).promise();
  if (result.$response.error) {
    throw result.$response.error;
  }

  console.log(result);
};
