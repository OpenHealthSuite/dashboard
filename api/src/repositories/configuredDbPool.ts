import { Pool } from 'pg'

export const configuredDbPool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING || ''
})
