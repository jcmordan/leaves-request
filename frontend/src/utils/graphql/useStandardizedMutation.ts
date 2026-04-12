import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

import type { DocumentNode, OperationVariables } from "@apollo/client";

type MutationArgs<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
> = {
  mutation: DocumentNode;
  errorMessage?: string;
  message?: string;
  options?: useMutation.Options<TData, TVariables>;
};

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const apolloError = error as {
      graphQLErrors?: Array<{ message: string }>;
      networkError?: { message: string };
      message?: string;
    };

    if (apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0) {
      return apolloError.graphQLErrors[0].message;
    }

    if (apolloError.networkError) {
      return apolloError.networkError.message;
    }

    if (apolloError.message) {
      return apolloError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const useStandardizedMutation = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>({
  mutation,
  message,
  errorMessage,
  options,
}: MutationArgs<TData, TVariables>) => {
  const [mutate, { loading, error }] = useMutation<TData, TVariables>(
    mutation,
    options,
  );

  const handleCommit = async (
    variables: TVariables,
    mutationOptions?: useMutation.Options<TData, TVariables>,
  ) => {
    try {
      const result = await mutate({
        ...mutationOptions,
        variables,
      });

      if (result.data) {
        if (message) {
          toast.success(message);
        }

        return result.data;
      }

      throw new Error("No data returned from mutation");
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err);

      if (errorMessage) {
        toast.error(errorMessage);
      }

      throw new Error(errorMsg);
    }
  };

  return {
    mutate: handleCommit,
    submitting: loading,
    error,
  };
};
