export const port = process.env.PORT || 5050;

export const keycloakURL = process.env.KEYCLOAK_URL || 'https://kf-keycloak-qa.kf-strides.org/auth';
export const keycloakRealm = process.env.KEYCLOAK_REALM || 'kidsfirstdrc';
export const keycloakClient = process.env.KEYCLOAK_CLIENT || 'kidsfirst-apis';

export const projectId = process.env.PROJECT_ID;

export const esHost = process.env.ES_HOST;

export const esFileIndex = process.env.ES_FILE_INDEX;
export const esFileType = process.env.ES_FILE_TYPE;

export const survivalPyFile = process.env.SURVIVAL_PY_FILE || 'resource/py/survival.py';
export const pythonPath = process.env.PYTHON_PATH || '/usr/local/bin/python3';

export const sqsQueueUrl = process.env.SQS_QUEUE_URL || ''