import zod from 'zod'
import { useCORS } from 'nitro-cors'
import { getDataByOwner } from '../utils/functions/get'

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
      // Manually parsing the request body
      const bodyPromise = new Promise((resolve, reject) => {
        let body = ''
        event.node.req.on('data', (chunk) => {
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
        const records = await getDataByOwner(owner)
        if (records === null) {
          return Response.json({ error: 'records not found' }, { status: 404 })
        }

        return Response.json({ records }, { status: 200 })
      } catch (error) {
        console.error('Error fetching records by owner:', error)
        return Response.json(
          { error: 'Internal Server Error' },
          { status: 500 },
        )
      }
    } catch (e) {
      console.error('Error with Route', e)
    }
  }
})
