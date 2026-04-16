import { ApolloClient } from "@apollo/client-integration-nextjs";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { authErrorLink } from "./apollo-error-link";
import { 
  getApolloCache, 
  defautApolloOptions, 
  defaultFetchOptions 
} from "./apollo-cache";

/**
 * Client Component Client (for use in ApolloNextAppProvider / ApolloClientProvider)
 */
export function makeClient(accessToken?: string | null) {
  const isServer = typeof window === "undefined";
  
  // Use absolute URL on server (SSR) and relative on client
  const uri = isServer 
    ? (process.env.GRAPHQL_ENDPOINT || "http://localhost:5148/graphql/")
    : "/api/graphql";

  const uploadLink = new UploadHttpLink({
    uri,
    fetchOptions: defaultFetchOptions,
    headers: {
      authorization: accessToken ? `Bearer ${accessToken}` : "",
      "Apollo-Require-Preflight": "true",
    },
  });

  return new ApolloClient({
    link: authErrorLink.concat(uploadLink as any),
    cache: getApolloCache(),
    defaultOptions: defautApolloOptions,
  });
}
