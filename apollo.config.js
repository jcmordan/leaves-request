import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "../.env" });

export default {
  client: {
    service: {
      name: "leave-management-graphql",
      url: process.env.GRAPHQL_ENDPOINT,
    },
    includes: ["./frontend/src/**/*.{ts,tsx,graphql}"],
    excludes: ["./frontend/src/__generated__/**/*"],
  },
};
