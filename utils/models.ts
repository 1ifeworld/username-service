import { ColumnType } from 'kysely'
import z from 'zod'

export const ZodName = z.object({
  id: z.string(), // Mandatory userId
  name: z.string().regex(/^[a-z0-9][a-z0-9-]{0,20}$/), // Mandatory username
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

export interface NameInKysely {
  id: string
  name: string
  owner: string
  signature: string
  timestamp: string
  to: string
}
