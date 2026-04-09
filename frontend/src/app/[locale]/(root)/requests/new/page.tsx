import { Suspense } from "react";
import { getClient, PreloadQuery } from "@/lib/apollo-client";
import { ABSENCE_TYPES_QUERY } from "./graphql/NewRequestQueries";
import NewRequestForm from "./components/NewRequestForm";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * New Request Page (Server Component).
 * Preloads absence types for the request form.
 */
export default async function NewRequestPage() {
  return (
    <Suspense fallback={<NewRequestPageSkeleton />}>
      <PreloadQuery query={ABSENCE_TYPES_QUERY}>
        <NewRequestForm />
      </PreloadQuery>
    </Suspense>
  );
}

function NewRequestPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
