const query = `
  query {
    __schema {
      queryType {
        fields {
          name
          type {
            kind
            name
            ofType { kind, name }
          }
        }
      }
    }
  }
`;
fetch("http://localhost:5148/graphql/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);
