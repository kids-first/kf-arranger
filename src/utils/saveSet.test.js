import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { postProcessSaveSet } from './saveSet';
import SQS from 'aws-sdk/clients/sqs';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';

const mockSaveSetData = {
  setId: '123xyyz',
  createdAt: Date.now(),
  ids: ['id1', '1d2'],
  size: 2,
  sqon: {
    op: 'and',
    content: [
      {
        op: 'in',
        content: {
          field: 'observed_phenotype.name',
          value: ['Abnormality of the cardiovascular system (HP:0001626)'],
        },
      },
    ],
  },
  type: 'participant',
  userId: 'd1c3f78f-a68f-46c4-a44f-9d1249d6337e',
  path: 'kf_id',
  sort: [],
  tag: 'test',
};

describe('Test case for SQS SendMessage', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it('should return a successful response', async () => {
    AWSMock.mock('SQS', 'sendMessage', () => Promise.resolve({ MessageId: '123' }));
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
    const res = await postProcessSaveSet(sqs)(mockSaveSetData);
    expect(res.MessageId).to.equal('123');
  });

  it('should throw when the queue does not respond', async () => {
    AWSMock.mock('SQS', 'sendMessage', () => Promise.reject('could not send data to queue'));
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
    try {
      await postProcessSaveSet(sqs)(mockSaveSetData);
    } catch (err) {
      expect(err).to.eql('could not send data to queue');
    }
  });
});
