import { createKysely } from '../createKysely'
import { Name } from './../models'
import { stringifyNameForDb } from '../utils'

export async function set(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  await db.transaction().execute(async (trx) => {
    const existingRecord = await trx
      .selectFrom('names')
      .where('id', '=', nameData.id)
      .executeTakeFirst()

    if (existingRecord) {
      await trx
        .updateTable('names')
        .set({ name: nameData.name })
        .where('id', '=', nameData.id)
        .execute()
    } else {
      await trx
        .insertInto('names')
        .values(body)
        .execute()
    }
  }).catch((error) => {
    console.error('Error in setting name:', error)
    throw error
  })
}
