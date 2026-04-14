import { graphql } from "@/__generated__";

export const ABSENCE_TYPES_QUERY = graphql(`
  query GetAbsenceTypes2 {
    absenceTypes(first: 10) {
      nodes {
        id
        name
        requiresDoctor
        requiresAttachment
      }
    }
  }
`);
