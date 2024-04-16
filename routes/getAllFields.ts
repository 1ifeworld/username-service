import zod from 'zod'
import { useCORS } from 'nitro-cors'
import { HTTPMethod } from './getIdByOwner'
import { getAllFields } from '../utils/functions/get'

export default defineEventHandler(async (event) => {
  const corsOptions = {
    methods: ['GET', 'POST', 'OPTIONS'] as HTTPMethod[],
    allowHeaders: [
      'Authorization',
      'Content-Type',
      'Access-Control-Allow-Origin',
    ],
    preflight: { statusCode: 204 },
  }

  useCORS(event, corsOptions)

  if (event.node.req.method === 'OPTIONS') {
  } else if (event.node.req.method !== 'POST') {
    return createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  } else {
    try {
      const body = await readBody(event)

      const schema = zod.object({
        field: zod.string(),
        value: zod.union([zod.string(), zod.number()]),
      })

      const validationResult = schema.safeParse(body)
      console.log(validationResult)

      if (!validationResult.success) {
        return Response.json({ Error }, { status: 400 })
      }

      const { field, value } = validationResult.data

      const record = await getAllFields( field, value)

      if (!record) {
        return Response.json({ error: 'No record found' }, { status: 404 })
      }

      return Response.json(record, { status: 200 })
    } catch (error) {
      console.error('Error with Route:', error)
      return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
})
