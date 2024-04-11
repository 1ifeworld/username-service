// // import { createKysely } from '../createKysely'
// // import { Name } from '../models'
// // import { stringifyNameForDb } from '../utils'

// // export async function setOrUpdate(nameData: Name) {
// //   const db = createKysely()
// //   const body = stringifyNameForDb(nameData)

// //   try {
// //     console.log('in updateNameAndArchive')
// //     await db.transaction().execute(async (trx) => {
// //       const updateBody = { ...body }
// //       delete updateBody.id

// //       const existingNameRecord = await trx
// //         .selectFrom('names')
// //         .selectAll()
// //         .where('id', '=', nameData.id)
// //         .executeTakeFirst()

// //       if (existingNameRecord && existingNameRecord.name !== nameData.name) {
// //         console.log('update condition hit')

// //         await trx.insertInto('changelog').values(body).execute()

// //         await trx
// //           .updateTable('names')
// //           .set(updateBody)
// //           .where('id', '=', nameData.id)
// //           .execute()
// //       } else if (!existingNameRecord) {
// //         console.log('set condition hit')
// //         await trx
// //           .insertInto('names')
// //           .values(body)
// //           .onConflict((oc) => oc.column('name').doUpdateSet(body))
// //           .execute()
// //       }
// //     })
// //   } catch (error) {
// //     console.error('Error in setting name:', error)
// //     throw error
// //   }
// // }

// import { createKysely } from '../createKysely'
// import { Name } from '../models'
// import { stringifyNameForDb } from '../utils'

// export async function setOrUpdate(nameData: Name) {
//   const db = createKysely()
//   const body = stringifyNameForDb(nameData)
//   const providedTimestamp = Date.now()

//   try {
//     console.log('in updateNameAndArchive')
//     await db.transaction().execute(async (trx) => {
//       const updateBody = { ...body }
//       delete updateBody.id

//       const existingNameRecord = await trx
//         .selectFrom('names')
//         .selectAll()
//         .where('id', '=', nameData.id)
//         .executeTakeFirst()

//       const lastUpdateTimestamp = existingNameRecord ? new Date(existingNameRecord.timestamp).getTime() : 0
//       const secondsIn14Days = 1209600
//       const currentTimestampInSeconds = Math.floor(Date.now() / 1000)
//       const lastUpdateTimestampInSeconds = Math.floor(lastUpdateTimestamp / 1000)

//       if (currentTimestampInSeconds - lastUpdateTimestampInSeconds < secondsIn14Days) {
//         console.error('Name change not allowed within 14 days of last edit')
//         throw new Error('Name change not allowed within 14 days of last edit')
//       }

//       if (existingNameRecord && existingNameRecord.name !== nameData.name) {
//         console.log('update condition hit')

//         await trx.insertInto('changelog').values(body).execute()

//         await trx
//           .updateTable('names')
//           .set(updateBody)
//           .where('id', '=', nameData.id)
//           .execute()
//       } else if (!existingNameRecord) {
//         console.log('set condition hit')
//         await trx
//           .insertInto('names')
//           .values(body)
//           .execute()
//       }
//     })
//   } catch (error) {
//     console.error('Error in setting name:', error)
//     throw error
//   }
// }


import { createKysely } from '../createKysely'
import { Name } from '../models'
import { stringifyNameForDb } from '../utils'

export async function setOrUpdate(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  const currentTimestampInSeconds = Math.floor(Date.now() / 1000)

  try {
    console.log('in setOrUpdate')
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

        if (currentTimestampInSeconds - lastUpdateTimestampInSeconds < secondsIn14Days) {
          console.error('Name change not allowed within 14 days of last edit')
          throw new Error('Name change not allowed within 14 days of last edit')
        }

        if (existingNameRecord.name !== nameData.name) {
          console.log('Update condition hit')

        await trx.insertInto('changelog')
        .values(body)
        .execute()

          await trx
          .updateTable('names')
          .set(updateBody)
          .where('id', '=', nameData.id)
          .execute()
        }
      } else {
        console.log('Insert condition hit')
        await trx
          .insertInto('names')
          .values(body)
          .execute()
      }
    })
  } catch (error) {
    console.error('Error in setting or updating name:', error)
    throw error
  }
}
