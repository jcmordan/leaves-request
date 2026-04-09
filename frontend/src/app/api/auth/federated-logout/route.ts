import { auth } from '@/auth'

/**
 * Federated logout endpoint.
 *
 * If using an OAuth/OIDC provider (e.g., Keycloak, Auth0),
 * replace the redirect logic below to call the provider's end-session endpoint.
 */
export async function GET() {
  const nextAuthUrl = (process.env.NEXTAUTH_URL ?? '').replace(/\/$/, '')
  let redirectPath = `${nextAuthUrl}/auth/signout`

  try {
    const session = await auth()
    if (session) {
      // TODO: If using an OIDC provider, build the end-session URL here
      // Example for Keycloak:
      // const endSessionURL = new URL(`${issuer}/protocol/openid-connect/logout`)
      // endSessionURL.search = new URLSearchParams({
      //   post_logout_redirect_uri: redirectPath,
      //   client_id: process.env.CLIENT_ID ?? '',
      // }).toString()
      // redirectPath = endSessionURL.toString()
    }
  } catch {
    // Fall through to default redirect
  }

  return Response.json({ url: redirectPath })
}
