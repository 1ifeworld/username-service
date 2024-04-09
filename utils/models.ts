import { ColumnType } from 'kysely'
import z from 'zod'

export interface NameInKysely {
  id: string
  name: string
  owner: string
  signature: string
  timestamp: string
  to: string
}

export const ZodName = z.object({
  id: z.string(), // Mandatory userId
  name: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,20}$/), // Mandatory username
  owner: z.string(), // Mandatory privy address
  signature: z.string(), // Mandatory ECDSA signature
  timestamp: z.string().optional(), // Optional unix timestamp
  to: z.string().optional(), // Optional '' for unregistering a new username
})

export const ZodNameWithSignature = ZodName.extend({
  signature: z.object({
    hash: z.string(),
    message: z.string(),
  }),
})

export type Name = z.infer<typeof ZodName>
export type NameWithSignature = z.infer<typeof ZodNameWithSignature>
export type Changelog = z.infer<typeof ZodChangelog>


export interface ChangelogInKysely {
  id: string
  name: [string]
  owner: [string]
  signature: [string]
  timestamp: [string]
  to: [string]
}

export const ZodChangelog = z.object({
  id: z.string(), // Mandatory userId
  name: z.array(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,20}$/)), // Array of usernames
  owner: z.array(z.string()), // Array of privy addresses
  signature: z.array(z.string()), // Array of ECDSA signatures
  timestamp: z.array(z.string()).optional(), // Optional array of unix timestamps
  to: z.array(z.string()).optional(), // Optional array, empty strings for unregistering new usernames
})


