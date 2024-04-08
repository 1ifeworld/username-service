import { createKysely } from '../createKysely'
import { Name } from './../models'
import { stringifyNameForDb } from '../utils'

export async function updateNameAndArchive(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  await db.transaction().execute(async (trx) => {
    // Step 1: Fetch the existing record.
    const existingRecord = await trx
      .selectFrom('names')
      .selectAll()
      .where('name', '=', nameData.name)
      .executeTakeFirst()

    if (!existingRecord) {
      throw new Error(`Name not found: ${nameData.name}`)
    }

    // Convert existingRecord to a format suitable for historicalNames table if needed
    // This might involve transforming the record or omitting certain fields
    const historicalRecord = { ...existingRecord } // Adjust as necessary

    // Step 2: Insert the fetched record into the historicalNames table.
    await trx
      .insertInto('historicalNames')
      .values(historicalRecord)
      .execute()

    // Step 3: Update the record in the names table with the new data.
    await trx
      .updateTable('names')
      .set(body)
      .where('name', '=', nameData.name)
      .execute()
  }).catch((error) => {
    console.error('Error in updating name and archiving:', error)
    throw error
  })
}
