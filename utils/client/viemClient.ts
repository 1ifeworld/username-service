import {  http, createPublicClient } from 'viem'
import { optimism } from 'viem/chains'


export const publicClient = createPublicClient({
  chain: optimism,
  transport: http(process.env.RPC_URL),
})

