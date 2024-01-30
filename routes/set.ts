import { ZodName } from '../utils/models'
import { set } from '../utils/functions/set'
import { Hex, verifyMessage } from 'viem'
import { useCORS } from 'nitro-cors'
import { HTTPMethod } from './getIdByOwner'
import { addresses } from '../utils/constants/contracts'
import { idRegistryABI } from '../utils/abi/generated'
import { publicClient } from '../utils/client/viemClient'

export default defineEventHandler(async (event) => {
  // Define CORS options
  const corsOptions = {
    methods: ['GET', 'POST', 'OPTIONS'] as HTTPMethod[],
    allowHeaders: [
      'Authorization',
      'Content-Type',
      'Access-Control-Allow-Origin',
    ],
    preflight: { statusCode: 204 },
  }

  // Apply CORS to the request
  useCORS(event, corsOptions)

  if (event.node.req.method === 'OPTIONS') {
  } else if (event.node.req.method !== 'POST') {
    return createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  } else {
    try {
      let body
      try {
        body = await readBody(event)
      } catch (error) {
        console.error('Error parsing request body:', error)
        return { success: false, error: 'Invalid request', statusCode: 400 }
      }

      // Extract data from the body for Zod validation

      console.log('body', body)

      // Validate the data with Zod
      const parseResult = ZodName.safeParse(body)
      if (!parseResult.success) {
        console.error('Invalid input')
        return { success: false, error: 'Invalid input', statusCode: 400 }
      }

      const ownerId = await publicClient.readContract({
        address: addresses.idRegistry.river_j5bpjduqfv,
        abi: idRegistryABI,
        functionName: 'idOwnedBy',
        args: [parseResult.data.owner as Hex],
      })

      console.log("ID to check for", parseResult.data.id)
      console.log("OWNERID", ownerId)

      if (ownerId.toString() == parseResult.data.id) {
        console.log("IS OWNER!") }
      else if (ownerId.toString() !== parseResult.data.id) {
        return {
          success: false,
          error: 'Not the owner of the ID',
          statusCode: 401,
        }
      }

      // Validate signature
      try {
        const messageToVerify = JSON.stringify(parseResult.data)

        const isValidSignature = verifyMessage({
          address: parseResult.data.owner as Hex,
          signature: parseResult.data.signature as Hex,
          message: messageToVerify,
        })

        if (!isValidSignature) {
          throw new Error('Invalid signature')
        }
      } catch (err) {
        console.error(err)
        const response = { success: false, error: 'Invalid signature' }
        return Response.json(response, { status: 401 })
      }

      try {
        await set(parseResult.data)
        const response = { success: true }
        return Response.json(response, { status: 201 })
      } catch (err) {
        console.error('Error caught in setName:', err)
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        const response = { success: false, error: errorMessage }
        return Response.json(response, { status: 500 })
      }
    } catch (e) {
      console.error('Error with Route', e)
    }
  }
})
