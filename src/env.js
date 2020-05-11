export const port = process.env.PORT || 5050;

export const egoURL = process.env.EGO_API;

export const projectId = process.env.PROJECT_ID;

export const esHost = process.env.ES_HOST;

export const esFileIndex = process.env.ES_FILE_INDEX;
export const esFileType = process.env.ES_FILE_TYPE;

export const survivalPyFile = process.env.SURVIVAL_PY_FILE || 'resource/py/survival.py';
export const pythonPath = process.env.PYTHON_PATH || '/usr/local/bin/python3';

export const sqsQueueUrl = process.env.SQS_QUEUE_URL || ''