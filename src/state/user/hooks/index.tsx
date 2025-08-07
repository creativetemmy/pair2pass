
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { Hex, hexToBigInt } from 'viem'
import { useWalletClient } from 'wagmi'
import { GAS_PRICE_GWEI } from '../../types'
import {
  setSubgraphHealthIndicatorDisplayed,
  updateGasPrice,
} from '../actions'
import { ChainId } from '@/config/chains'
import { AppState, useAppDispatch } from '@/state'
import { useActiveChainId } from '@/hooks/useActiveChainId'



export function useSubgraphHealthIndicatorManager() {
  const dispatch = useAppDispatch()
  const isSubgraphHealthIndicatorDisplayed = useSelector<
    AppState,
    AppState['user']['isSubgraphHealthIndicatorDisplayed']
  >((state) => state.user.isSubgraphHealthIndicatorDisplayed)

  const setSubgraphHealthIndicatorDisplayedPreference = useCallback(
    (newIsDisplayed: boolean) => {
      dispatch(setSubgraphHealthIndicatorDisplayed(newIsDisplayed))
    },
    [dispatch],
  )

  return [isSubgraphHealthIndicatorDisplayed, setSubgraphHealthIndicatorDisplayedPreference] as const
}





const DEFAULT_BSC_GAS_BIGINT = BigInt(GAS_PRICE_GWEI.default)
const DEFAULT_BSC_TESTNET_GAS_BIGINT = BigInt(GAS_PRICE_GWEI.testnet)

/**
 * Note that this hook will only works well for BNB chain
 */
export function useDefaultGasPrice(chainIdOverride?: number, enabled = true): bigint | undefined {
  const { chainId: chainId_, isWrongNetwork } = useActiveChainId()
  const chainId = chainIdOverride ?? chainId_

  const { data: signer } = useWalletClient({ chainId })

  const queryEnabled = Boolean(!isWrongNetwork && signer && chainId === ChainId.BSC && enabled)

  const { data: defaultGasPrice } = useQuery({
    queryKey: ['bscProviderGasPrice', signer],
    queryFn: async () => {
      // @ts-ignore
      const gasPrice = await signer?.request({
        method: 'eth_gasPrice' as any,
      })
      return hexToBigInt(gasPrice as Hex)
    },
    enabled: queryEnabled,
    placeholderData: queryEnabled ? DEFAULT_BSC_GAS_BIGINT : undefined,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  return defaultGasPrice
}

/**
 * Note that this hook will only works well for BNB chain
 */
export function useGasPrice(chainIdOverride?: number): bigint | undefined {
  const { chainId: chainId_ } = useActiveChainId()
  const chainId = chainIdOverride ?? chainId_
  const userGas = useSelector<AppState, AppState['user']['gasPrice']>((state) => state.user.gasPrice)
  const bscProviderGasPrice = useDefaultGasPrice(chainIdOverride, userGas === GAS_PRICE_GWEI.rpcDefault)
  if (chainId === ChainId.BSC) {
    return userGas === GAS_PRICE_GWEI.rpcDefault ? bscProviderGasPrice : BigInt(userGas ?? GAS_PRICE_GWEI.default)
  }
  if (chainId === ChainId.BSC_TESTNET) {
    return DEFAULT_BSC_TESTNET_GAS_BIGINT
  }
  return undefined
}

export function useGasPriceManager(): [string, (userGasPrice: string) => void] {
  const dispatch = useAppDispatch()
  const userGasPrice = useSelector<AppState, AppState['user']['gasPrice']>((state) => state.user.gasPrice)

  const setGasPrice = useCallback(
    (gasPrice: string) => {
      dispatch(updateGasPrice({ gasPrice }))
    },
    [dispatch],
  )

  return [userGasPrice, setGasPrice]
}





