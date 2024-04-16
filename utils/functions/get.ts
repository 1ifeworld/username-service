import { createKysely } from '../createKysely'
import { Name } from '../models'
import { parseNameFromDb } from '../utils'

export async function get(name: string): Promise<Name | null> {
  ;('Entering get function')
  try {
    const db = createKysely()
    ;('Executing database query')
    const record = await db
      .selectFrom('names')
      .selectAll()
      // temp
      .where('name', '=', name)
      .executeTakeFirst()

    if (!record) {
      ;('No record found')
      return null
    }
    ;('Parsing record from database')
    const returnRecord = parseNameFromDb(record)
    console.log({returnRecord})
    return returnRecord
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error caught in get function:', error, error.stack)
    } else {
      console.error('Error caught in get function:', error)
    }
    throw error // Re-throw the error to be handled by the calling function
  }
}

export async function getID(id: string): Promise<Name | null> {
  ;('Entering getID function')
  try {
    const db = createKysely()
    ;('Executing database query')
    const record = await db
      .selectFrom('names')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()

    if (!record) {
      ;('No record found')
      return null
    }
    ;('Parsing record from database')
    return parseNameFromDb(record)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error caught in get function:', error, error.stack)
    } else {
      console.error('Error caught in get function:', error)
    }
    throw error // Re-throw the error to be handled by the calling function
  }
}

export async function getAllFields(field: string): Promise<Array<string | number> | null> {
  console.log('Entering getAllFields function')
  try {
    const db = createKysely()
    console.log('Executing database query to get all values from a field')
    const records = await db
      .selectFrom('names')
      .select(field)
      .execute()

    if (!records || records.length === 0) {
      console.log('No records found')
      return null
    }

    console.log('Retrieved records:', records)
    const values = records.map(record => record[field])
    console.log({ values })
    return values
  } catch (error) {
    console.error('Error caught in getAllFields function:', error)
    throw error
  }
}
