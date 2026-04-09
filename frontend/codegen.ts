import type { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env" });


const config: CodegenConfig = {
  schema: process.env.GRAPHQL_ENDPOINT,
  documents: ["src/**/*.{ts,tsx,graphql}", "!src/**/*.test.{ts,tsx}"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
    },
    "./src/__generated__/possibleTypes.ts": {
      plugins: ["fragment-matcher"],
      config: {
        useExplicitTypenames: true,
      },
    },
  },
};

export default config;
