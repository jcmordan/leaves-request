import { Suspense } from "react";
import { PreloadQuery } from "@/lib/apollo/apollo-client-rsc";
import { GET_REQUEST_DETAIL_QUERY } from "./graphql/RequestDetailsQueries";
import RequestDetailView from "./components/RequestDetailView";
import { XCircle } from "lucide-react";

interface RequestDetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

const RequestDetailPageSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant/50">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  );
};


/**
 * RequestDetailPage Server Component
 * Implements PreloadQuery for SSR data fetching.
 */
export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-on-surface-variant/60">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-error/50" />
          <p className="text-sm font-bold">Request ID missing</p>
        </div>
      </div>
    );
  }

  return (
    <PreloadQuery query={GET_REQUEST_DETAIL_QUERY} variables={{ id }}>
      <Suspense fallback={<RequestDetailPageSkeleton />}>
        <RequestDetailView />
      </Suspense>
    </PreloadQuery>
  );
}

