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


export async function getAllFields(
  field: string,
  value: string | number,
): Promise<Partial<Name> | null> {
  console.log('Entering getSpecificFields function')
  try {
    const db = createKysely()
    console.log('Executing database query with specific fields')
    const record = await db
      .selectFrom('names')
      .select(field)
      .where(field, '=', value)
      .executeTakeFirst()

    if (!record) {
      console.log('No record found')
      return null
    }
    console.log('Parsing record from database')
    const returnRecord = parseNameFromDb(record)
    console.log({ returnRecord })
    return returnRecord
  } catch (error) {
    console.error('Error caught in getSpecificFields function:', error)
    throw error
  }
}
