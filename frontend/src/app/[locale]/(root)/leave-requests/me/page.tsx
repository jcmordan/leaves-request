import { Suspense } from "react";
import { PreloadQuery } from "@/lib/apollo/apollo-client-rsc";
import { MY_REQUESTS_QUERY } from "./graphql/MyRequestsQueries";
import MyRequestsView from "./components/MyRequestsView";
import RequestsPageSkeleton from "../shared/components/RequestsPageSkeleton";

/**
 * MyRequests Page (Server Component)
 * Implements PreloadQuery approach to minimize waterfall loading.
 * Wraps MyRequestsView in a Suspense boundary for a better UX.
 */
export default async function MyRequestsPage() {
  return (
    <PreloadQuery query={MY_REQUESTS_QUERY} variables={{ first: 10 }}>
      <Suspense fallback={<RequestsPageSkeleton />}>
        <MyRequestsView />
      </Suspense>
    </PreloadQuery>
  );
}
