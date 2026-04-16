import { Suspense } from "react";
import { PreloadQuery } from "@/lib/apollo/apollo-client-rsc";
import { GET_APPROVALS_DASHBOARD_QUERY } from "./graphql/ApprovalListQueries";
import TeamApprovalsView from "./components/TeamApprovalsView";
import RequestsPageSkeleton from "../shared/components/RequestsPageSkeleton";

/**
 * Approvals Page (Server Component)
 */
export default async function ApprovalsPage() {
  return (
    <PreloadQuery 
      query={GET_APPROVALS_DASHBOARD_QUERY} 
      variables={{ first: 10 }}
    >
      <Suspense fallback={<RequestsPageSkeleton />}>
        <TeamApprovalsView />
      </Suspense>
    </PreloadQuery>
  );
}
