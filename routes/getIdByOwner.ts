import zod from 'zod'
import { getIdByOwner } from '../utils/functions/id'
import { useCORS } from 'nitro-cors'

export type HTTPMethod =
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'

export default defineEventHandler(async (event) => {

   // Define CORS options
   const corsOptions = {
    methods: ['GET','POST', 'OPTIONS'] as HTTPMethod[],
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
    // End the response for OPTIONS request
    return { statusCode: 204 }
  }

  // Ensure this is a POST request
  if (event.node.req.method !== 'POST') {
    return { error: 'Method not allowed', statusCode: 405 }
  }

  // Manually parsing the request body
  const bodyPromise = new Promise((resolve, reject) => {
    let body = ''
    event.node.req.on('data', chunk => {
      body += chunk.toString()
    })
    event.node.req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    })
  })

  let body
  try {
    body = await bodyPromise
  } catch (error) {
    console.error('Error parsing request body:', error)
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  const schema = zod.object({
    owner: zod.string(),
  })

  const safeParse = schema.safeParse(body)

  if (!safeParse.success) {
    const response = { error: 'Invalid input' }
    return Response.json(response, { status: 400 })
  }

  const { owner } = safeParse.data

  try {
    const id = await getIdByOwner(owner)
    if (id === null) {
      return Response.json({ error: 'Id not found' }, { status: 404 })
    }

    return Response.json({ id }, { status: 200 })
  } catch (error) {
    console.error('Error fetching id by owner:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
})
