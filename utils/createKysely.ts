import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import { NameInKysely } from './models'
import pkg from 'pg'

const { Pool } = pkg

export interface Database {
  // names: NameInKysely
  nombres: NameInKysely

}

let dbInstance = null

export function createKysely() {
  if (!dbInstance) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    dbInstance = new Kysely<Database>({
      dialect: new PostgresDialect({ pool }),
      plugins: [new CamelCasePlugin()],
    })
  }
  return dbInstance
}
