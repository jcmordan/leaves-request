import { ApolloClient, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { HttpLink } from "@apollo/client/link/http";

const httpLink = new HttpLink({
  uri: '/api/graphql/',
});

let wsLink: GraphQLWsLink | null = null;
if (typeof window !== 'undefined') {
  wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:5148/graphql/',
    // Note: for WebSockets, if we want them to be authenticated via BFF,
    // we would need a different approach (e.g. passing the token in the initial request).
    // For now, we'll keep it as is or handle it if subscriptions are critical.
  }));
}

const splitLink = typeof window !== 'undefined' && wsLink != null
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    )
  : httpLink;

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
