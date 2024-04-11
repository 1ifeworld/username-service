// import { ZodName } from '../utils/models'
// import { get } from '../utils/functions/get'
// import { set } from '../utils/functions/set'
// import { Hex, verifyMessage } from 'viem'
// import { useCORS } from 'nitro-cors'
// import { HTTPMethod } from './getIdByOwner'
// import { updateNameAndArchive } from '../utils/functions/update'

// export default defineEventHandler(async (event) => {
//   // Define CORS options
//   const corsOptions = {
//     methods: ['GET', 'POST', 'OPTIONS'] as HTTPMethod[],
//     allowHeaders: [
//       'Authorization',
//       'Content-Type',
//       'Access-Control-Allow-Origin',
//     ],
//     preflight: { statusCode: 204 },
//   }

//   // Apply CORS to the request
//   useCORS(event, corsOptions)

//   if (event.node.req.method === 'OPTIONS') {
//   } else if (event.node.req.method !== 'POST') {
//     return createError({ statusCode: 405, statusMessage: 'Method not allowed' })
//   } else {
//     try {
//       let body
//       try {
//         body = await readBody(event)
//       } catch (error) {
//         console.error('Error parsing request body:', error)
//         return { success: false, error: 'Invalid request', statusCode: 400 }
//       }

//       // Extract data from the body for Zod validation

//       console.log('body', body)

//       // Validate the data with Zod
//       const parseResult = ZodName.safeParse(body)
//       if (!parseResult.success) {
//         console.error('Invalid input')
//         return { success: false, error: 'Invalid input', statusCode: 400 }
//       }
//       console.log("PARSE", parseResult.data.owner)

//       let ownerId
//       try {
//         ownerId = await publicClient.readContract({
//           address: addresses.idRegistry.optimism,
//           abi: idRegistryABI,
//           functionName: 'idOf',
//           args: [parseResult.data.owner as Hex],
//         })
//       } catch (error) {
//         console.error('Error fetching owner ID:', error)
//         return {
//           success: false,
//           error: 'Error fetching owner ID',
//           statusCode: 500,
//         }
//       }

//       console.log('Fetched owner ID:', ownerId)
//       console.log('ID to check for', parseResult.data.id)

//       if (ownerId.toString() !== parseResult.data.id) {
//         return {
//           success: false,
//           error: 'Not the owner of the ID',
//           statusCode: 401,
//         }
//       }

//       console.log('TO OWNERSHIp')
//       let nameOwned
//       console.log("not json", parseResult.data.id)
//       console.log("json", JSON.stringify({ id: parseResult.data.id }))

//       try {
//         nameOwned = await fetch(
//           'https://username-service-production.up.railway.app/getUsernameById',
//           {
//             method: 'POST',
//             body: JSON.stringify({ id: parseResult.data.id }),
//             headers: { 'Content-Type': 'application/json' },
//           },
//         ).then((res) => res.json())
//       } catch (error) {
//         console.error('Error fetching username:', error)
//         console.log('NAME OWNED', nameOwned)
//         return {
//           success: false,
//           error: 'Unable to fetch username',
//           statusCode: 500,
//         }
//       }

//       // Validate signature
//       try {
//         const messageToVerify = JSON.stringify(parseResult.data)

//         const isValidSignature = verifyMessage({
//           address: parseResult.data.owner as Hex,
//           signature: parseResult.data.signature as Hex,
//           message: messageToVerify,
//         })

//         if (!isValidSignature) {
//           throw new Error('Invalid signature')
//         }
//       } catch (err) {
//         console.error(err)
//         const response = { success: false, error: 'Invalid signature' }
//         return Response.json(response, { status: 401 })
//       }

//       validateTimestampWithin60Seconds(parseResult.data.timestamp)

//       // Before proceeding with operations that depend on the 28-days rule
//       await validateNameChangeWithin28Days(parseResult.data.id, parseResult.data.timestamp)

//       // Assuming 'existingName' needs to be fetched here for further logic
//       const existingName = await get(parseResult.data.name)

//       // Save the name
//       try {
//         if (existingName) {
//           await updateNameAndArchive({ ...parseResult.data })
//       } else {
//         await set(parseResult.data)
//         const response = { success: true }
//         return Response.json(response, { status: 201 })
//       } } catch (err) {
//         console.error('Error caught in setName:', err)
//         const errorMessage =
//           err instanceof Error ? err.message : 'An unexpected error occurred'
//         const response = { success: false, error: errorMessage }
//         return Response.json(response, { status: 500 })
//       }
//     } catch (e) {
//       console.error('Error with Route', e)
//     }
//   }
// })

// function validateTimestampWithin60Seconds(providedTimestamp: string) {
//   const currentTimestampInSeconds =  Math.floor(Date.now())
//   const timestamp = parseInt(providedTimestamp|| '0')
//   if (timestamp > currentTimestampInSeconds + 60) {
//     console.error('Invalid timestamp')
//     return { success: false, error: 'Invalid timestamp', statusCode: 400 }
//   }

// }

// async function validateNameChangeWithin28Days(id: string, providedTimestamp: string) {
//   const lastSetTimestamp = await getLastTimestampById(id)
//   const secondsIn28Days = 2419200 // 28 days in seconds
//   const currentTimestampInSeconds =  Math.floor(Date.now())
//   const timestamp = parseInt(providedTimestamp || '0')

//   if (timestamp - lastSetTimestamp < secondsIn28Days) {
//     throw createError({ statusCode: 400, statusMessage: 'Name change not allowed within 28 days' })
//   }
// }

// async function getLastTimestampById(id: string) {
//   try {
//     const response = await fetch(
//       'https://username-service-production.up.railway.app/getLastTimestamp',
//       {
//         method: 'POST',
//         body: JSON.stringify({ id }),
//         headers: { 'Content-Type': 'application/json' },
//       }
//     )
//     if (!response.ok) {
//       throw new Error(`Failed to fetch last timestamp, status: ${response.status}`)
//     }
//     const data = await response.json()
//     return data.timestamp // Adjust this based on the actual structure of your response
//   } catch (error) {
//     console.error('Error fetching last timestamp:', error)
//     throw createError({ statusCode: 500, statusMessage: 'Error checking name ownership' })
//   }
// }

import { ZodName } from '../utils/models'
import { get } from '../utils/functions/get'
import { set } from '../utils/functions/set'
import { Hex, verifyMessage } from 'viem'
import { useCORS } from 'nitro-cors'
import { HTTPMethod } from './getIdByOwner'
import { updateNameAndArchive } from '../utils/functions/update'

export default defineEventHandler(async (event) => {
    const corsOptions = {
        methods: ['GET', 'POST', 'OPTIONS'] as HTTPMethod[],
        allowHeaders: ['Authorization', 'Content-Type', 'Access-Control-Allow-Origin'],
        preflight: { statusCode: 204 },
    }

    useCORS(event, corsOptions)

    if (event.node.req.method === 'OPTIONS') {
        // OPTIONS method is automatically handled by useCORS.
        return
    } else if (event.node.req.method !== 'POST') {
        return { success: false, statusCode: 405, error: 'Method not allowed' }
    }

    let body
    try {
        body = await readBody(event)
    } catch (error) {
        return { success: false, error: 'Error parsing request body', statusCode: 400 }
    }

    const parseResult = ZodName.safeParse(body)
    if (!parseResult.success) {
        return { success: false, error: 'Invalid input', statusCode: 400 }
    }

    const currentTimestampInSeconds = Math.floor(Date.now())
    const providedTimestamp = parseInt(parseResult.data.timestamp || '0')
    if (providedTimestamp > currentTimestampInSeconds + 60) {
        return { success: false, error: 'Invalid timestamp', statusCode: 400 }
    }

    let ownerId
    try {
      console.log("owner id check")
        ownerId = await publicClient.readContract({
            address: addresses.idRegistry.optimism,
            abi: idRegistryABI,
            functionName: 'idOf',
            args: [parseResult.data.owner as Hex],
        })
    } catch (error) {
        return { success: false, error: 'Error fetching owner ID', statusCode: 500 }
    }

    if (ownerId.toString() !== parseResult.data.id) {
        return { success: false, error: 'Not the owner of the ID', statusCode: 401 }
    }

    let nameOwned
    try {
      console.log("name owned ")
        const response = await fetch('https://username-service-production.up.railway.app/getUsernameById', {
            method: 'POST',
            body: JSON.stringify({ id: parseResult.data.id }),
            headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok) {
            throw new Error('Failed to fetch username')
        }
        nameOwned = await response.json()
    } catch (error) {
        return { success: false, error: 'Unable to fetch username', statusCode: 500 }
    }

    const isValidSignature = verifyMessage({
        address: parseResult.data.owner as Hex,
        signature: parseResult.data.signature as Hex,
        message: JSON.stringify(parseResult.data),
    })

    if (!isValidSignature) {
        return { success: false, error: 'Invalid signature', statusCode: 401 }
    }

    const existingName = await get(parseResult.data.name)
    console.log("existing name")
    if (existingName && existingName.owner !== parseResult.data.owner) {
        return { success: false, error: 'Name already taken', statusCode: 409 }
    }


    let lastSetTimestamp
    try {
      console.log("time stamp checks")
        const response = await fetch('https://username-service-production.up.railway.app/getLastTimestamp', {
            method: 'POST',
            body: JSON.stringify({ id: parseResult.data.id }),
            headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok) {
            throw new Error('Failed to fetch last timestamp')
        }
        const data = await response.json()
        lastSetTimestamp = data.timestamp
    } catch (error) {
        return { success: false, error: 'Unable to fetch last timestamp', statusCode: 500 }
    }

    const secondsIn14Days = 2419200/2 // 14 days in seconds
    if (providedTimestamp - lastSetTimestamp < secondsIn14Days) {
        return { success: false, error: 'Name change not allowed within 28 days', statusCode: 400 }
    }

    try {
        if (existingName) {
            await updateNameAndArchive(parseResult.data)
            console.log("update")
        } else {
            await set(parseResult.data)
            console.log("we're setting")

        }
        return { success: true, statusCode: existingName ? 200 : 201 }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        return { success: false, error: errorMessage, statusCode: 500 }
    }
})
