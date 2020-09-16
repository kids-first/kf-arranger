import { sqsQueueUrl } from '../env';

export const postProcessSets = (sqs) => async data => {
  const params = { MessageBody: JSON.stringify(data), QueueUrl: sqsQueueUrl };
  return sqs.sendMessage(params).promise();
};
