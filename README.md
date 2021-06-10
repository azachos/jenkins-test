# app-template

## Prerequisites
- Make sure you have the Phrase CLI installed: https://github.com/phrase/phrase-cli/releases/
- Run `npm login --registry http://npm-registry.productsup.com:4873` to log into our private repository
- Add `127.0.0.1 local.template.productsup.com` to hosts file
- Run `npm install`

## Serve locally
- Run `npm run serve`
- Navigate to `http://local.template.productsup.com`

## Build standalone app
- Run `npm run build`

## Build and publish as library
- Run `npm version patch|minor|major` to increment version
- Run `npm run bundle` to build as library
- Run `npm run publish` to publish to our private repository
