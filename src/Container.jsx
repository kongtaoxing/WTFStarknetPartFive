import React from 'react'
import { StarknetConfig, InjectedConnector } from '@starknet-react/core'
import App from './App'

export default function Container({ Component, pageProps }) {
  const connectors = [
    new InjectedConnector({ options: { id: 'braavos' }}),
    new InjectedConnector({ options: { id: 'argentX' }}),
  ]
  return (
    <StarknetConfig connectors={connectors}>
      <App {...pageProps} />
    </StarknetConfig>
  )
}