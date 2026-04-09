import { ErrorLink } from '@apollo/client/link/error'
import { redirect } from 'next/navigation'

export const authErrorHandler = ({ graphQLErrors }: any) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions.code === 'AUTH_NOT_AUTHORIZED') {
        redirect('/unauthorized')
      }

      if (err.extensions.code === 'AUTH_NOT_AUTHENTICATED') {
        redirect('/auth/logout')
      }
    }
  }
}

export const authErrorLink = new ErrorLink(authErrorHandler)
