import { ZodName } from '../utils/models'
import { get } from '../utils/functions/get'
import { set } from '../utils/functions/set'
import { Hex, verifyMessage } from 'viem'
import { useCORS } from 'nitro-cors'
import { HTTPMethod } from './getIdByOwner'

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
      console.log("PARSE", parseResult.data.owner)
      // time stamp check
      const currentTimestamp = Math.floor(Date.now())
      console.log(currentTimestamp)
      const providedTimestamp = parseInt(parseResult.data.timestamp || '0')
      if (providedTimestamp > currentTimestamp + 60) {
        console.error('Invalid timestamp')
        return { success: false, error: 'Invalid timestamp', statusCode: 400 }
      }
      let ownerId
      try {
        ownerId = await publicClient.readContract({
          address: addresses.optimism.idRegistry,
          abi: idRegistryABI,
          functionName: 'idOf',
          args: [parseResult.data.owner as Hex],
        })
      } catch (error) {
        console.error('Error fetching owner ID:', error)
        return {
          success: false,
          error: 'Error fetching owner ID',
          statusCode: 500,
        }
      }

      console.log('Fetched owner ID:', ownerId)
      console.log('ID to check for', parseResult.data.id)

      if (ownerId.toString() !== parseResult.data.id) {
        return {
          success: false,
          error: 'Not the owner of the ID',
          statusCode: 401,
        }
      }

      console.log('TO OWNERSHIp')
      let nameOwned
      console.log("not json", parseResult.data.id)
      console.log("json", JSON.stringify({ id: parseResult.data.id }))

      try {
        nameOwned = await fetch(
          'https://username-service-production.up.railway.app/getUsernameById',
          {
            method: 'POST',
            body: JSON.stringify({ id: parseResult.data.id }),
            headers: { 'Content-Type': 'application/json' },
          },
        ).then((res) => res.json())
      } catch (error) {
        console.error('Error fetching username:', error)
        console.log('NAME OWNED', nameOwned)
        return {
          success: false,
          error: 'Unable to fetch username',
          statusCode: 500,
        }
      }

      let lastSetTimestamp
      try {
        lastSetTimestamp = await fetch(
          'https://username-service-production.up.railway.app/getLastTimestamp',
          {
            method: 'POST',
            body: JSON.stringify({ id: parseResult.data.id }),
            headers: { 'Content-Type': 'application/json' },
          },
        ).then((res) => res.json())

        const secondsIn28Days = 2419200
        if (providedTimestamp - lastSetTimestamp < secondsIn28Days) {
          console.error('Name change not allowed within 28 days')
          return {
            success: false,
            error: 'Name change not allowed within 28 days',
            statusCode: 400,
          }
        }
      } catch (error) {
        console.error('Error checking name ownership:', error)
        return {
          success: false,
          error: 'Error checking name ownership',
          statusCode: 500,
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

      // Check if the name is already taken
      const existingName = await get(parseResult.data.name)
      if (existingName && existingName.owner !== parseResult.data.owner) {
        const response = { success: false, error: 'Name already taken' }
        return Response.json(response, { status: 409 })
      }

      // Save the name
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
