import zod from 'zod'
import { get } from '../utils/functions/get'
import { HTTPMethod } from './getIdByOwner'
import { useCORS } from 'nitro-cors'

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
  username: zod.string().regex(/^[a-z0-9-.]+$/, 'Invalid username format'),
})

const safeParse = schema.safeParse(body)

if (!safeParse.success) {
  const response = { error: 'Invalid input' }
  return Response.json(response, { status: 400 })
}

const { username } = safeParse.data

try {
  const nameData = await get(username)

  if (nameData === null) {
    return Response.json({ exists: false }, { status: 404 })
  }

  return Response.json({ exists: true }, { status: 200 })
} catch (error) {
  console.error('Error fetching name data:', error)
  return Response.json({ error: 'Internal Server Error' }, { status: 500 })
}
})
