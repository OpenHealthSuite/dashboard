import { CASSANDRA_CLIENT } from './cassandra'

// Probably worth looking into this more formally
const MIGRATIONS: string[] = [
  "CREATE KEYSPACE IF NOT EXISTS paceme WITH REPLICATION = {'class':'SimpleStrategy','replication_factor':1};",
  'CREATE TABLE IF NOT EXISTS paceme.user_service_token (service_id text, paceme_user_id text, raw_token text, expires_in int, last_updated timestamp, PRIMARY KEY (paceme_user_id, service_id));',
  'CREATE TABLE IF NOT EXISTS paceme.user_setting (setting_id text, user_id text, details text, PRIMARY KEY (user_id, setting_id));',
  'CREATE INDEX IF NOT EXISTS ON paceme.user_service_token (last_updated);',
  'CREATE INDEX IF NOT EXISTS ON paceme.user_service_token (expires_in);'
]
export async function runMigrations (pathToMigrations: string) {
  await CASSANDRA_CLIENT.connect().then(async () => {
    for (const migration of MIGRATIONS) {
      await CASSANDRA_CLIENT.execute(migration)
    }
  })
}
