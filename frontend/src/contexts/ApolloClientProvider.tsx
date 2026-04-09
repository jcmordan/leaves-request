'use client'

import { ApolloProvider } from '@apollo/client/react'
import { useSession } from 'next-auth/react'
import { useRef, useMemo, useEffect } from 'react'

import { makeClient } from '@/lib/makeClient'

export const ApolloClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  const accessToken = session?.accessToken
  const clientRef = useRef<ReturnType<typeof makeClient> | null>(null)
  const previousTokenRef = useRef<string | null | undefined>(accessToken)

  const client = useMemo(() => {
    // Only create a new client if the token actually changed
    if (accessToken !== previousTokenRef.current || !clientRef.current) {
      previousTokenRef.current = accessToken
      if (clientRef.current) {
        clientRef.current.stop()
      }
      clientRef.current = makeClient(accessToken)
    }

    return clientRef.current
  }, [accessToken])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.stop()
        clientRef.current = null
      }
    }
  }, [])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
