import { createWalletClient, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { river_j5bpjduqfv } from './customChainConfig'
import { optimismGoerli } from 'viem/chains'
import { Hex } from 'viem'

// const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex)

export const publicClient = createPublicClient({
  chain: river_j5bpjduqfv,
  transport: http(process.env.RPC_URL),
})

// export const relayWalletClient = createWalletClient({
//   account,
//   chain: river_j5bpjduqfv,
//   transport: http(process.env.RPC_URL),
// })
