
import { ChainId } from '@/config/chains'
import { isChainSupported } from '@/utils/wagmi'
import { atom } from 'jotai'
import { useDeferredValue, useMemo } from 'react'

import { useAccount } from 'wagmi'
// import { useSessionChainId } from './useSessionChainId'

export const queryChainIdAtom = atom(-1) // -1 unload, 0 no chainId on query

// queryChainIdAtom.onMount = (set) => {
//   const params = new URL(window.location.href).searchParams
//   let chainId
//   // chain has higher priority than chainId
//   // keep chainId for backward compatible
//   const c = params.get('chain')
//   if (!c) {
//     chainId = params.get('chainId')

//     console.log("chainId",chainId)
//   } else {
//     chainId = getChainId(c)
//      console.log('chainId', chainId)
//   }
//   if (isChainSupported(+chainId)) {
//     set(+chainId)
//   } else {
//     set(0)
//   }
// }

export function useLocalNetworkChain() {
  // const [queryChainId, setQueryChainId] = useAtom(queryChainIdAtom)
  // const { query } = useRouter()
  // const chainId = +(getChainId(query.chain as string) || queryChainId)
  const { chainId: wagmiChainId } = useAccount()

  // useEffect(() => {
  //   if (wagmiChainId) {
  //     setQueryChainId(wagmiChainId)
  //   }
  // }, [wagmiChainId, setQueryChainId])

  if (isChainSupported(wagmiChainId || ChainId.BASE_SEPOLIA)) {
    return wagmiChainId
  }

  return undefined
}

export const useActiveChainId = () => {
  // const localChainId = useLocalNetworkChain()
  // const queryChainId = useAtomValue(queryChainIdAtom)

  const { chainId: wagmiChainId } = useAccount()
  // const chainId =
  //   localChainId ?? wagmiChainId ?? (queryChainId === ChainId.BASE_SEPOLIA ? ChainId.BASE_SEPOLIA : undefined)
  const isNotMatched = useDeferredValue(false)
  const isWrongNetwork = useMemo(
    () => wagmiChainId !== ChainId.BASE_SEPOLIA || isNotMatched,
    [wagmiChainId, isNotMatched],
  )

  return {
    chainId: wagmiChainId && isChainSupported(wagmiChainId) ? wagmiChainId : ChainId.BASE_SEPOLIA,
    isWrongNetwork,
    isNotMatched,
  }
}
