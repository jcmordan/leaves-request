import "server-only";

import { ApolloClient, registerApolloClient } from "@apollo/client-integration-nextjs";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { auth } from "@/auth";
import { getApiUrl } from "../../../envUtils";
import { authErrorLink } from "./apollo-error-link";
import { 
  getApolloCache, 
  defautApolloOptions, 
  defaultFetchOptions 
} from "./apollo-cache";

/**
 * Server Component Client (for direct RSC queries)
 */
export const { getClient, query, PreloadQuery } = registerApolloClient(
  async () => {
    const session = await auth();
    const token = session?.accessToken;

    const uri = await getApiUrl();

    return new ApolloClient({
      cache: getApolloCache(),
      link: authErrorLink.concat(
        new UploadHttpLink({
          uri,
          fetchOptions: defaultFetchOptions,
          headers: {
            authorization: token ? `Bearer ${token}` : "",
            "Apollo-Require-Preflight": "true",
          },
        }) as any,
      ),
      defaultOptions: defautApolloOptions,
    });
  },
);
