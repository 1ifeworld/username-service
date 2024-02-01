import zod from "zod";
import { get } from "../utils/functions/get";
import { HTTPMethod } from "./getIdByOwner";
import { useCORS } from "nitro-cors";

export default defineEventHandler(async (event) => {
  console.log("ROUTE HIT")
  // Define CORS options
  const corsOptions = {
    methods: ["GET", "POST", "OPTIONS"] as HTTPMethod[],
    allowHeaders: [
      "Authorization",
      "Content-Type",
      "Access-Control-Allow-Origin",
    ],
    preflight: { statusCode: 204 },
  };

  // Apply CORS to the request
  useCORS(event, corsOptions);

  if (event.node.req.method === "OPTIONS") {
  } else if (event.node.req.method !== "POST") {
    return createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  } else {
    try {
      console.log("PARSING BODY")
      // Using readBody to parse the request body
      const body = await readBody(event)
      console.log("BODY", body)

      const schema = zod.object({
        username: zod
          .string()
          .regex(/^[a-z0-9-.]+$/, "Invalid username format"),
      });

      const safeParse = schema.safeParse(body)

      console.log("SAFE PARSE", safeParse)

      if (!safeParse.success) {
        const response = { error: "Invalid input" };
        return Response.json(response, { status: 400 })
      }

      const { username } = safeParse.data

      console.log("USERNAME", username)

      try {
        const nameData = await get(username)
        console.log({nameData})

        if (nameData === null) {
          return Response.json({ exists: false }, { status: 404 })
        }
        console.log(nameData)
        return Response.json({ ...nameData,  exists: true }, { status: 200 })
      } catch (error) {
        console.error("Error fetching name data:", error)
        return Response.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    } catch (e) {
      console.error("Error with Route", e)
    }
  }
})
