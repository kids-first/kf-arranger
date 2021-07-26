import { keycloakURL } from './env';

const keycloakConfig = {
    realm: 'KidsFirst',
    'confidential-port': 0,
    'bearer-only': true,
    'auth-server-url': keycloakURL,
    'ssl-required': 'external',
    resource: 'kf-arranger',
};

export default keycloakConfig;
