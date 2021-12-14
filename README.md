<p align="center">
  <img src="docs/portal_logo.png" alt="Kids First Portal">
</p>
<p align="center">
  <a href="https://github.com/kids-first/kf-arranger/blob/master/LICENSE"><img src="https://img.shields.io/github/license/kids-first/kf-arranger.svg?style=for-the-badge"></a>
</p>

# Kids First Arranger Server

This is an instantiation of the [@kfarranger/server](https://github.com/kids-first/arranger/tree/master/modules/server) application for the Kids First portal, with an integration with [Keycloak](https://www.keycloak.org/) for authentication.

Arranger server is an application that wraps Elasticsearch and provides a GraphQL search API for consumption by [@kfarranger/components](https://github.com/kids-first/arranger/tree/master/modules/components), and other UI components used in the [Kids First Portal UI](https://github.com/kids-first/kf-portal-ui).

## Development:

* Installing dependencies: `npm install`
* Installing dependencies (survival plot): `pip install SurvivalPy`
* Starting development: `npm run watch`
