import { graphql } from "@/__generated__";

export const ABSENCE_TYPES_QUERY = graphql(`
  query GetAbsenceTypes {
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
