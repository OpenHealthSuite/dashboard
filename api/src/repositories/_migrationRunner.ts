import { migrate } from 'postgres-migrations'
import { configuredDbPool } from './configuredDbPool'

export async function runMigrations (pathToMigrations: string) {
  await migrate({ client: configuredDbPool }, pathToMigrations)
}
