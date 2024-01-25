import { ZodName } from '../utils/models'
import { get } from '../utils/functions/get'
import { set } from '../utils/functions/set'
import { Hex, verifyMessage } from 'viem'
import { useCORS } from 'nitro-cors'
import { HTTPMethod } from './getIdByOwner'

export default defineEventHandler(async (event) => {
  console.log('setname')

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

  // Handle preflight (OPTIONS) request
  if (event.node.req.method === 'OPTIONS') {
    return { statusCode: 204 } // End the response for OPTIONS request
  }
  // Ensure this is a POST request
  if (event.node.req.method !== 'POST') {
    return { error: 'Method not allowed', statusCode: 405 }
  }

  // Manually parsing the request body
  let body
  try {
    body = await new Promise((resolve, reject) => {
      let rawData = ''
      event.node.req.on('data', (chunk) => {
        rawData += chunk.toString()
      })
      event.node.req.on('end', () => resolve(JSON.parse(rawData)))
    })
  } catch (error) {
    console.error('Error parsing request body:', error)
    return Response.json(
      { success: false, error: 'Invalid request' },
      { status: 400 },
    )
  }

  // Reformat the received data
  const { registrationParameters, signature } = body
  const { owner } = registrationParameters

  const reformattedData = {
    ...registrationParameters,
    signature,
    owner,
  }

  console.log(reformattedData)

  // Validate the data
  const parseResult = ZodName.safeParse(reformattedData)

  console.log(parseResult)
  if (!parseResult.success) {
    console.error('Invalid input')
    return Response.json(
      { success: false, error: 'Invalid input' },
      { status: 400 },
    )
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
})
