const query = `
  query GetDashboardData($first: Int) {
    absenceRequests(first: $first) {
      id
      startDate
      endDate
      status
      reason
      absenceType {
        id
        name
      }
    }
    absenceTypes {
      id
      name
      deductsFromBalance
    }
  }
`;

async function test() {
  try {
    const res = await fetch("http://localhost:5148/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { first: 5 } }),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
