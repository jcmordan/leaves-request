/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateRequestInput = {
  absenceType: Scalars['String']['input'];
  category: Scalars['String']['input'];
  doctorName?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['String']['input'];
  hospitalName?: InputMaybe<Scalars['String']['input']>;
  reason: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export type LeaveRequest = {
  __typename?: 'LeaveRequest';
  absenceType: Scalars['String']['output'];
  category: Scalars['String']['output'];
  doctorName?: Maybe<Scalars['String']['output']>;
  duration: Scalars['Int']['output'];
  employee: User;
  endDate: Scalars['String']['output'];
  hospitalName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
  startDate: Scalars['String']['output'];
  status: RequestStatus;
  submittedAt: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createRequest: LeaveRequest;
  updateRequestStatus: LeaveRequest;
};


export type MutationCreateRequestArgs = {
  input: CreateRequestInput;
};


export type MutationUpdateRequestStatusArgs = {
  comments?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status: RequestStatus;
};

export type Query = {
  __typename?: 'Query';
  allRequests: Array<LeaveRequest>;
  me: User;
  myRequests: Array<LeaveRequest>;
  pendingApprovals: Array<LeaveRequest>;
};


export type QueryAllRequestsArgs = {
  status?: InputMaybe<RequestStatus>;
};

export enum RequestStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type CreateRequestMutationVariables = Exact<{
  input: CreateRequestInput;
}>;


export type CreateRequestMutation = { __typename?: 'Mutation', createRequest: { __typename?: 'LeaveRequest', id: string, status: RequestStatus } };


export const CreateRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateRequestMutation, CreateRequestMutationVariables>;