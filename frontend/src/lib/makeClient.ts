import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { relayStylePagination } from "@apollo/client/utilities";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";

import possibleTypes from "../__generated__/possibleTypes";
import { authErrorLink } from "./apollo-error-link";

/**
 * Registry of fields that require Relay Pagination merging logic.
 */
const PAGINATED_FIELDS_REGISTRY = {
  employees: false,
  absenceRequests: false,
  absenceTypes: false,
  departments: false,
} as const;

/**
 * Generates field policies for the Apollo cache based on the PAGINATED_FIELDS_REGISTRY.
 */
const generateFieldPolicies = (registry: Record<string, string[] | false>) => {
  return Object.entries(registry).reduce((acc, [fieldName, keyArgs]) => {
    acc[fieldName] = relayStylePagination(keyArgs);
    return acc;
  }, {} as any);
};

const graphqlUri = "/api/graphql";

export function makeClient(accessToken?: string | null) {
  const uploadLink = new UploadHttpLink({
    uri: graphqlUri,
    fetchOptions: {
      credentials: "same-origin",
    },
    headers: {
      authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  return new ApolloClient({
    link: authErrorLink.concat(uploadLink as any),
    cache: new InMemoryCache({
      possibleTypes: possibleTypes.possibleTypes,
      typePolicies: {
        EmployeesConnection: {
          keyFields: [],
        },
        AbsenceRequestsConnection: {
          keyFields: [],
        },
        AbsenceTypesConnection: {
          keyFields: [],
        },
        DepartmentsConnection: {
          keyFields: [],
        },
        Query: {
          fields: {
            ...generateFieldPolicies(PAGINATED_FIELDS_REGISTRY),
          },
        },
      },
    }),
  });
}
