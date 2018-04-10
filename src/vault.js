const vaultAwsAuth = require("vault-auth-aws");

const options = {
  apiVersion: "v1",
  endpoint: process.env.VAULT_ENDPOINT,
  token: process.env.VAULT_TOKEN
};

let vault = null;

const getSecretValue = async secretPath => {
  if (vault !== null) {
    return vault.read(secretPath).then(res => res.data.value);
  } else {
    if (process.env.VAULT_AUTHENTICATION === "AWS_IAM") {
      return new vaultAwsAuth({ host: options.endpoint })
        .authenticate()
        .then(success => {
          vault = require("node-vault")({
            ...options,
            token: success.auth.client_token
          });
          return getSecretValue(secretPath);
        });
    } else {
      vault = require("node-vault")(options);
      return getSecretValue(secretPath);
    }
  }
};

export default {
  getSecretValue
};
