import { createKysely } from '../createKysely'
import { Name } from './../models'
import { stringifyNameForDb } from '..//utils'

export async function set(nameData: Name) {
  const db = createKysely()
  const body = stringifyNameForDb(nameData)

  try {
    console.log('in set function')
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
