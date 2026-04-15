import { Suspense } from "react";
import { PreloadQuery } from "@/lib/apollo-client";
import { ALL_REQUESTS_QUERY } from "./graphql/AdministrationQueries";
import AllRequestsView from "./components/AllRequestsView";
import RequestsPageSkeleton from "../shared/components/RequestsPageSkeleton";

/**
 * AllRequests Page (Server Component)
 */
export default async function AllRequestsPage() {
  return (
    <PreloadQuery query={ALL_REQUESTS_QUERY} variables={{ first: 10 }}>
      <Suspense fallback={<RequestsPageSkeleton />}>
        <AllRequestsView />
      </Suspense>
    </PreloadQuery>
  );
}
