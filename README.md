# PaceMe.js - Run planning application, in javascript.

The core idea is to be a nicely deployable run/training planning application, to help keep track of the runs being done.

## Prerequisites

- Node (ideally, use a version manager like `fnm` or `nvm`)
- Docker
- A fitbit application registered for `http://localhost:3000`
- [credstash](https://github.com/fugue/credstash) - will probably find a replacement at some point, but we need some secrets
  - There are a few credstash keys that need to be populated:
    - Local:
      - `paceme-local/fitbit-client-id`
      - `paceme-local/fitbit-client-secret`
    - Helm deployment script
      - `paceme/fitbit-client-id`
      - `paceme/fitbit-client-secret`
      - `paceme/oauth2.clientid`
      - `paceme/oauth2.secret`
      - `paceme/oauth2.cookiesecret`

**NOTE: Helm deployment script is basically just for deploying the helm chart to `app.paceme.info`**

## Getting Started

From the root, run:
- `npm i` to install root utility functions
- `npm run stack:spinup` to pull and start the needed docker images (postgres and redis)
- `npm run stack:devenvfiles` to generate your .env files
- `npm run stack:install` to do the needed `npm install`'s
- `npm run start` to start both the API and Webapp concurrently