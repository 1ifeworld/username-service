import { createKysely } from '../createKysely'
import { Name } from '../models'
import { stringifyNameForDb } from '../utils'

export async function setOrUpdate(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  const currentTimestampInSeconds = Math.floor(Date.now() / 1000)

  try {
    await db.transaction().execute(async (trx) => {
      const updateBody = { ...body }
      delete updateBody.id

      const existingNameRecord = await trx
        .selectFrom('names')
        .selectAll()
        .where('id', '=', nameData.id)
        .executeTakeFirst()

      if (existingNameRecord) {
        const lastUpdateTimestampInSeconds = existingNameRecord.timestamp
        const secondsIn14Days = 1209600

        if (
          currentTimestampInSeconds - lastUpdateTimestampInSeconds <
          secondsIn14Days
        ) {
          console.error('Name change not allowed within 14 days of last edit')
          throw {
            name: 'TimestampViolationError',
            message: 'Name change not allowed within 14 days of last edit',
            statusCode: 400,
          }
        }

        if (existingNameRecord && existingNameRecord.name !== nameData.name) {
          await trx.insertInto('changelog').values(body).execute()

          await trx
            .updateTable('names')
            .set(updateBody)
            .where('id', '=', nameData.id)
            .execute()
        }
      } else if (!existingNameRecord) {
        await trx.insertInto('names').values(body).execute()
      }
    })
  } catch (error) {
    console.error('Error in setting name:', error)
    throw error
  }
}
