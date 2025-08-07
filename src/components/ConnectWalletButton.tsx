import { ChainId } from '@/config/chains'
import { useActiveChainId } from '@/hooks/useActiveChainId'
import useAuth from '@/hooks/useAuth'
import { Fragment, useMemo, useState } from 'react'
import { useConnect } from 'wagmi'
import { Button, ButtonProps } from './ui/button'


const ConnectWalletButton = ({ children, ...props }: ButtonProps) => {
  const { login } = useAuth()
  
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const [open, setOpen] = useState(false)



  return (
    <>
      <Button onClick={() => setOpen(true)} {...props}>
        {children || <Fragment>Connect Wallet</Fragment>}
      </Button>
      <style jsx global>{`
        w3m-modal {
          position: relative;
          z-index: 99;
        }
      `}</style>
     
    </>
  )
}

export default ConnectWalletButton
