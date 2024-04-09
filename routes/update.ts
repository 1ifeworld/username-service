import { ZodName } from '../utils/models'
import { get } from '../utils/functions/get'
import { useCORS } from 'nitro-cors'
import { HTTPMethod } from './getIdByOwner'
import { updateNameAndArchive } from '../utils/functions/update'

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
    // Handle CORS preflight
  } else if (event.node.req.method !== 'POST') {
    return createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  } else {
    try {
      let body = await readBody(event)

      console.log('body', body)

      const parseResult = ZodName.safeParse(body)
      if (!parseResult.success) {
        console.error('Invalid input')
        return { success: false, error: 'Invalid input', statusCode: 400 }
      }

      // Perform similar validations as in your set route, e.g., timestamp, owner ID, signature verification
      // After validations, check if the name already belongs to the user (this prevents unnecessary archiving)
      const existingName = await get(parseResult.data.name)
      if (existingName && existingName.owner !== parseResult.data.owner) {
        return { success: false, error: 'Not the owner of the name', statusCode: 401 }
      }

      // Update and archive the name
      try {
        await updateNameAndArchive(parseResult.data)
        return { success: true, statusCode: 200 }
      } catch (err) {
        console.error('Error updating name:', err)
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        return { success: false, error: errorMessage, statusCode: 500 }
      }
    } catch (e) {
      console.error('Error with update route:', e)
      return { success: false, error: 'An unexpected error occurred', statusCode: 500 }
    }
  }
})
