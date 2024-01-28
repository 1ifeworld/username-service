import zod from 'zod'
import { get } from '../utils/functions/get'
import { HTTPMethod } from './getIdByOwner'
import { useCORS } from 'nitro-cors'

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
        return Response.json({ error: 'Invalid request' }, { status: 400 })
      }

      // Define the schema for expected body
      const schema = zod.object({
        id: zod.string(), // Assuming id as string due to previous BigInt serialization issue
      })

      const safeParse = schema.safeParse(body)

      if (!safeParse.success) {
        const response = { error: 'Invalid input' }
        return Response.json(response, { status: 400 })
      }

      const { id } = safeParse.data

      // Create Kysely instance
      const db = createKysely() // Assuming createKysely is properly configured

      try {
        const results = await db
          .selectFrom('names')
          .selectAll()
          .where('id', '=', id)
          .execute()

        const safeParsedResults = parseNameFromDb(results)

        if (!safeParsedResults[0].name) {
          return Response.json({ error: 'Username not found' }, { status: 404 })
        }

        const username = safeParsedResults[0].name

        return Response.json({ username }, { status: 200 })
      } catch (error) {
        // console.error('Error fetching username:', error)
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
