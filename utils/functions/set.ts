import { createKysely } from '../createKysely'
import { Name } from './../models'
import { stringifyNameForDb } from '..//utils'

export async function set(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  try {
    await db
      .insertInto('names')
      .values(body)
      .onConflict((oc) => oc.column('name').doUpdateSet(body))
      .execute()
  } catch (error) {
    console.error('Error in setting name:', error)
    throw error
  }
}
