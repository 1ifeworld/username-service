import zod from 'zod'
import { get, getID } from '../utils/functions/get'
import { HTTPMethod } from './getIdByOwner'
import { useCORS } from 'nitro-cors'

export default defineEventHandler(async (event) => {
  console.log("GET LAST TIMESTAMP ROUTE")
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
      const body = await readBody(event)

      const schema = zod.object({
        id: zod.string(),
      });

      const safeParse = schema.safeParse(body)
      
      if (!safeParse.success) {
        return createError({ statusCode: 400, statusMessage: 'Invalid input' });
      }

      if (!safeParse.success) {
        return Response.json({ error: 'Invalid input' }, { status: 400 })
      }

      const { id } = safeParse.data

      try {
        const data = await getID(id)

        if (!data) {
          return Response.json({ exists: false }, { status: 404 })
        }

        // Assuming the data includes a 'timestamp' field
        const timestamp = data.timestamp
        return Response.json({ timestamp }, { status: 200 })

      } catch (error) {
        console.error('Detailed error information:', error);
        return createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
      }
    } catch (e) {
      console.error('Error with Route', e)
    }
  }
})
