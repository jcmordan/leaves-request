export const getApiUrl = () => {
  return Promise.resolve(
    process.env.GRAPHQL_ENDPOINT || "http://localhost:5148/graphql/",
  );
}
