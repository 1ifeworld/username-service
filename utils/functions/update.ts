import { createKysely } from '../createKysely'
import { Name } from '../models'
import { stringifyNameForDb } from '../utils'

export async function setOrUpdate(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  try {
    console.log('in updateNameAndArchive')
    await db.transaction().execute(async (trx) => {
      const updateBody = { ...body }
      delete updateBody.id  

      const existingNameRecord = await trx
        .selectFrom('names')
        .selectAll()
        .where('id', '=', nameData.id)
        .executeTakeFirst()

      if (existingNameRecord && existingNameRecord.name !== nameData.name) {
        console.log("update condition hit")

        await trx.insertInto('changelog').values(body).execute()

        await trx
          .updateTable('names')
          .set(updateBody)
          .where('id', '=', nameData.id)
          .execute()
      } else if (!existingNameRecord) {
        console.log("set condition hit")
        await trx
        .insertInto('names')
        .values(body)
        .onConflict((oc) => oc.column('name').doUpdateSet(body))
        .execute()
      }
    })
  } catch (error) {
    console.error('Error in setting name:', error)
    throw error
  }
}
