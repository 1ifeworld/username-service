import { createKysely } from "../createKysely"
import { Name } from "./../models"
import { stringifyNameForDb } from "../utils"

export async function updateNameAndArchive(nameData: Name) {
    const db = createKysely()
    const body = stringifyNameForDb(nameData)

    try {
      await db.transaction().execute(async (trx) => {
        const existingNameRecord = await trx
          .selectFrom("names")
          .selectAll()
          .where("id", "=", nameData.id)
          .executeTakeFirst()

        if (!existingNameRecord) {
          throw new Error(`Record not found for ID: ${nameData.id}`)
        }

        const updatePromises = []

        Object.keys(body).forEach((field) => {
          if (existingNameRecord[field] !== body[field]) {
            const historicalRecord = {
              id: nameData.id,
              field: field,
              value: body[field],
              timestamp: new Date(),
            }

            updatePromises.push(
              trx.insertInto("historical_names").values(historicalRecord).execute()
            )
          }
        })

        await Promise.all(updatePromises)

        await trx
          .updateTable("names")
          .set(body)
          .where("id", "=", nameData.id)
          .execute()
      })
    } catch (error) {
      console.error("Error in updating name and archiving:", error)
      throw error
    }
  }
