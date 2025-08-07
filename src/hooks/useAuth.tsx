

import { useCallback } from 'react'
import { ConnectorNotFoundError, SwitchChainNotSupportedError, useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAtom } from 'jotai/index'
import { useAppDispatch } from '@/state'
import { queryChainIdAtom, useActiveChainId } from './useActiveChainId'
import { CHAIN_QUERY_NAME } from '@/config/chains'
import { clearUserStates } from './clearUserStates'
import { useNavigate } from 'react-router-dom'



const useAuth = () => {
  const dispatch = useAppDispatch()
  const { connectAsync, connectors } = useConnect()
  const { chain } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const { chainId } = useActiveChainId()
  const [, setQueryChainId] = useAtom(queryChainIdAtom)

  const navigate = useNavigate();

  const login = useCallback(
    async (connectorID) => {
      const findConnector = connectors.find((c) => c.id === connectorID)
      try {
        if (!findConnector) return undefined

        const connected = await connectAsync({ connector: findConnector, chainId })
        if (connected.chainId !== chainId) {

            navigate(`/profile`, { replace: true })
      
          setQueryChainId(connected.chainId)
        }
        return connected
      } catch (error) {
        if (error instanceof ConnectorNotFoundError) {
          throw new Error(`Connector with ID ${connectorID} not found.`)
        }
        if (
          error instanceof SwitchChainNotSupportedError
          // TODO: wagmi
          // || error instanceof SwitchChainError
        ) {
          throw new Error('Unable to switch network. Please try it on your wallet')
        }
      }
      return undefined
    },
    [connectors, connectAsync, chainId, setQueryChainId, null, navigate],
  )

  const logout = useCallback(async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error(error)
    } finally {
      clearUserStates(dispatch, { chainId: chain?.id })
    }
  }, [disconnectAsync, dispatch, chain?.id])

  return { login, logout }
}

export default useAuth
