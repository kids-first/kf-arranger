import { sqsQueueUrl } from '../env';

export const postProcessSaveSet = (sqs) => async data => {
  const params = { MessageBody: JSON.stringify(data), QueueUrl: sqsQueueUrl };
  return sqs.sendMessage(params).promise();
};
