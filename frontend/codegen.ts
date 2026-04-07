import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // If the backend isn't running, you could point to a local schema.graphql file
  schema: 'schema.graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.graphql'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: [],
    },
  },
};

export default config;
