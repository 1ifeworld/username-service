import { Insertable, Selectable } from 'kysely'

import { Name, NameInKysely, HistoricalName, HistoricalNameInKysely } from './models'

type SelectableKysely = Selectable<NameInKysely>;
type InsertableKysely = Insertable<NameInKysely>;
type SelectableHistoricalKysely = Selectable<HistoricalNameInKysely>;
type InsertableHistoricalKysely = Insertable<HistoricalNameInKysely>;

// Overloads for handling both Name and HistoricalName
export function parseNameFromDb(flatName: SelectableKysely | SelectableHistoricalKysely): Name | HistoricalName;
export function parseNameFromDb(flatName: (SelectableKysely | SelectableHistoricalKysely)[]): (Name | HistoricalName)[];

export function parseNameFromDb(
  flatName: SelectableKysely | SelectableHistoricalKysely | (SelectableKysely | SelectableHistoricalKysely)[],
): Name | HistoricalName | (Name | HistoricalName)[] {
  if (Array.isArray(flatName)) {
    return flatName.map(parseName);
  }

  return parseName(flatName);

  function parseName(name: SelectableKysely | SelectableHistoricalKysely) {
    if ('name' in name && Array.isArray(name.name)) {
      // Handling HistoricalName
      return {
        id: name.id,
        name: name.name,
        owner: name.owner,
        signature: name.signature,
        timestamp: name.timestamp,
        to: name.to,
      } as HistoricalName;
    } else {
      // Handling Name
      return {
        id: name.id,
        name: name.name,
        owner: name.owner,
        signature: name.signature,
        timestamp: name.timestamp,
        to: name.to,
      } as Name;
    }
  }
}

// Overloads for handling both Name and HistoricalName
export function stringifyNameForDb(name: Name | HistoricalName): InsertableKysely | InsertableHistoricalKysely;
export function stringifyNameForDb(name: (Name | HistoricalName)[]): (InsertableKysely | InsertableHistoricalKysely)[];

export function stringifyNameForDb(
  name: Name | HistoricalName | (Name | HistoricalName)[],
): InsertableKysely | InsertableHistoricalKysely | (InsertableKysely | InsertableHistoricalKysely)[] {
  if (Array.isArray(name)) {
    return name.map(stringifyName);
  }

  return stringifyName(name);

  function stringifyName(name: Name | HistoricalName) {
    if ('name' in name && Array.isArray(name.name)) {
      // Handling HistoricalName
      return {
        id: name.id,
        name: name.name,
        owner: name.owner,
        signature: name.signature,
        timestamp: name.timestamp,
        to: name.to,
      } as InsertableHistoricalKysely;
    } else {
      // Handling Name
      return {
        id: name.id,
        name: name.name,
        owner: name.owner,
        signature: name.signature,
        to: name.to,
        timestamp: name.timestamp,
      } as InsertableKysely;
    }
  }
}

export interface internalResponse {
  username: string;
  id: string;
  timestamp: string;
}

export async function getLastSetNameTimestamp(id: string): Promise<string> {
  try {
    console.log('INSIDE GET LAST SET TIME');
    const response = await $fetch<internalResponse>('/getLastTimestamp', {
      method: 'POST',
      params: { id },
    });

    return response.timestamp;
  } catch (error) {
    console.error('Error fetching last set timestamp:', error);
    throw new Error('Unable to fetch last set timestamp');
  }
}

export async function checkNameOwnership(id: string): Promise<boolean> {
  try {
    console.log('INSIDE CHECKNAME');
    const response = await $fetch<internalResponse>('/getUsernameById', {
      method: 'POST',
      body: { id },
    });

    return !response.username;
  } catch (error) {
    console.error('Error fetching username:', error);
    throw new Error('Unable to fetch username');
  }
}
