import {  http, createPublicClient } from 'viem'
import { arbitrumNova } from 'viem/chains'


export const publicClient = createPublicClient({
  chain: arbitrumNova,
  transport: http(process.env.RPC_URL),
})

