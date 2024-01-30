import { Insertable, Selectable } from 'kysely'

import { Name, NameInKysely } from './models'

type SelectableKysely = Selectable<NameInKysely>
type InsertableKysely = Insertable<NameInKysely>

/**
 * Parse `texts` and `addresses` from the database into JSON.
 * @param flatName Name from the database
 */
export function parseNameFromDb(flatName: SelectableKysely): Name
export function parseNameFromDb(flatName: SelectableKysely[]): Name[]
export function parseNameFromDb(
  flatName: SelectableKysely | SelectableKysely[],
): Name | Name[] {
  if (Array.isArray(flatName)) {
    return flatName.map(parseName)
  }

  return parseName(flatName)

  function parseName(name: SelectableKysely) {
    return {
      id: name.id,
      name: name.name,
      owner: name.owner,
      signature: name.signature,
      timestamp: name.timestamp,
      to: name.to,
    }
  }
}

/**
 * Stringify `texts` and `addresses` from JSON.
 * @param name Name to be inserted into the database
 */
export function stringifyNameForDb(name: Name): InsertableKysely
export function stringifyNameForDb(name: Name[]): InsertableKysely[]
export function stringifyNameForDb(
  name: Name | Name[],
): InsertableKysely | InsertableKysely[] {
  if (Array.isArray(name)) {
    return name.map(stringifyName)
  }

  return stringifyName(name)

   function stringifyName(name: Name) {
    return {
      id: name.id,
      name: name.name,
      owner: name.owner,
      signature: name.signature,
      to: name.to,
      timestamp: name.timestamp,
    }
  }
}
interface internalResponse {
  username: string
  id: string
  timestamp: string
}

export async function getLastSetNameTimestamp(id: string): Promise<string> {
  try {
    console.log("INSIDE GET LAST SET TIME")
    const response = await $fetch<internalResponse>('/getLastTimestamp', {
      method: 'POST',
      params: { id },
    })

    return response.timestamp
  } catch (error) {
    console.error('Error fetching last set timestamp:', error)
    throw new Error('Unable to fetch last set timestamp')
  }
}

export async function checkNameOwnership(id: string): Promise<boolean> {
  try {
    console.log("INSIDE CHECKNAME")
    const response = await $fetch<internalResponse>('/getUsernameById', {
      method: 'POST',
      body: { id },
    })

    return !response.username
  } catch (error) {
    console.error('Error fetching username:', error)
    throw new Error('Unable to fetch username')
  }
}

