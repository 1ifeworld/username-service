import { createKysely } from "../createKysely"
import { Name } from "../models"
import { sql } from 'kysely'
import { stringifyNameForDb } from "../utils"

export async function updateNameAndArchive(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  try {
    await db.transaction().execute(async (trx) => {
      const updateBody = { ...body }
      delete updateBody.id

      const existingNameRecord = await trx
        .selectFrom("names")
        .selectAll()
        .where("id", "=", nameData.id)
        .executeTakeFirst()

      if (!existingNameRecord) {
        throw new Error(`Record not found for ID: ${nameData.id}`)
      }

      if (existingNameRecord.name !== nameData.name) {
        const newEntries = {
          name: nameData.name,
          to: nameData.to,
          owner: nameData.owner,
          signature: nameData.signature,
          timestamp: nameData.timestamp
        }

        const existingHistoricalRecord = await trx
          .selectFrom("historical_names")
          .where("id", "=", nameData.id)
          .executeTakeFirst()

            if (existingHistoricalRecord) {
                if (existingHistoricalRecord) {
                    const currentNameArray = Array.isArray(existingHistoricalRecord.name) ? existingHistoricalRecord.name : []
                    const currentToArray = Array.isArray(existingHistoricalRecord.to) ? existingHistoricalRecord.to : []
                    const currentOwnerArray = Array.isArray(existingHistoricalRecord.owner) ? existingHistoricalRecord.owner : []
                    const currentSignatureArray = Array.isArray(existingHistoricalRecord.signature) ? existingHistoricalRecord.signature : []
                    const currentTimestampArray = Array.isArray(existingHistoricalRecord.timestamp) ? existingHistoricalRecord.timestamp : []

                    const updatedNameArray = [...currentNameArray, newEntries.name]
                    const updatedToArray = [...currentToArray, newEntries.to]
                    const updatedOwnerArray = [...currentOwnerArray, newEntries.owner]
                    const updatedSignatureArray = [...currentSignatureArray, newEntries.signature]
                    const updatedTimestampArray = [...currentTimestampArray, newEntries.timestamp]

                    await trx
                        .updateTable("historical_names")
                        .set({
                            name: updatedNameArray,
                            to: updatedToArray,
                            owner: updatedOwnerArray,
                            signature: updatedSignatureArray,
                            timestamp: updatedTimestampArray
                        })
                .where("id", "=", nameData.id)
                .execute()
        } else {
            await trx.insertInto("historical_names").values({
                id: nameData.id,
                name: [newEntries.name],
                to: [newEntries.to],
                owner: [newEntries.owner],
                signature: [newEntries.signature],
                timestamp: [newEntries.timestamp]
            }).execute()
        }

        await trx
          .updateTable('names')
          .set(updateBody)
          .where('id', '=', nameData.id)
          .execute()
      }
    })
  } catch (error) {
    console.error("Error in updating name and archiving:", error)
    throw error
  }
}
