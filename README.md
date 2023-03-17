# Dashboard

This dashboard comprises the always-on visiblity part of the [OpenHealthSuite](https://openhealthsuite.com) puzzle. It is the oldest part, and will probably be the last part completed.

## Development Prerequisites

- Node (ideally, use a version manager like `fnm` or `nvm`)
- Docker
- A fitbit application registered for `http://localhost:3000`
- [credstash](https://github.com/fugue/credstash) - will probably find a replacement at some point, but we need some secrets
  - There are a few credstash keys that need to be populated:
    - Local:
      - `paceme-local/fitbit-client-id`
      - `paceme-local/fitbit-client-secret`
## Getting Started

From the root, run:
- `npm i` to install root utility functions
- `npm run stack:spinup` to pull and start the needed docker images (postgres and redis)
- `npm run stack:devenvfiles` to generate your .env files
- `npm run stack:install` to do the needed `npm install`'s
- `npm run start` to start both the API and Webapp concurrently

## Configuration

- `FITBIT_CLIENT_ID`: Registered client for fitbit integration
- `FITBIT_CLIENT_SECRET`: Registered secret for fitbit integration
- `DEV_USER_ID`: User ID for "single user"/dev mode
- `SECURE_USER_HEADER_ID`: Header that will have a UserId in it
- `REDIS_HOST`: Host for redis cache
- `REDIS_PORT`: Port for redis cache
- `OPEN_FOOD_DIARY_API`: API root for OFD
- `OPEN_FOOD_DIARY_API_HEADER`: Header that should contain the User Id for OFD
- `CASSANDRA_CONTACT_POINTS`: `;` seperated list of cassandra contact points
- `CASSANDRA_LOCALDATACENTER`: the local datacenter for cassandra
- `CASSANDRA_USER`: username for cassandra
- `CASSANDRA_PASSWORD`: password for cassandra