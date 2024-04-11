import { createKysely } from "../createKysely"
import { Name } from "../models"
import { stringifyNameForDb } from "../utils"

export async function updateNameAndArchive(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  try {
    console.log("in updateNameAndArchive")
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
        await trx
          .selectFrom("changelog")
          .where("id", "=", nameData.id)
          .executeTakeFirst()

        await trx
          .insertInto("changelog")
          .values(
            body
          )
          .execute()

        await trx
          .updateTable("names")
          .set(updateBody)
          .where("id", "=", nameData.id)
          .execute()
      }
    })
  } catch (error) {
    console.error("Error in updating name and archiving:", error)
    throw error
  }
}
