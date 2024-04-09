import { createKysely } from '../createKysely'
import { Name } from './../models'
import { stringifyNameForDb } from '../utils'

export async function updateNameAndArchive(nameData: Name) {
    const db = createKysely()
    const body = stringifyNameForDb(nameData)

    await db.transaction().execute(async (trx) => {
        const existingRecord = await trx
            .selectFrom('names')
            .selectAll()
            .where('id', '=', nameData.id)
            .executeTakeFirst()

        if (!existingRecord) {
            throw new Error(`Record not found for ID: ${nameData.id}`)
        }
        if (existingRecord.name !== nameData.name) {
            const historicalRecord = {
                ...existingRecord,
            }
            await trx
                .insertInto('historicalNames')
                .values(historicalRecord)
                .execute()
        }
        await trx
            .updateTable('names')
            .set(body)
            .where('id', '=', nameData.id)
            .execute()
    }).catch((error) => {
        console.error('Error in updating name and archiving:', error)
        throw error
    })
}
