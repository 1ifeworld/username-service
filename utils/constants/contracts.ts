import { Hex } from 'viem'

type AddressMap = {
  [chainName: string]: Hex
}

type AddressBook = {
  [contractName: string]: AddressMap
}

export const addresses: AddressBook = {
  idRegistry: {
    optimism: '0x44192479891D358Ec917765dbF6472B916DC9A0C'
  },
}
