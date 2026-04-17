import { Suspense } from "react";
import { TeamCalendarView } from "./components/TeamCalendarView";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPage() {
  return (
    <div className="p-8">
      <Suspense fallback={<TeamCalendarLoading />}>
        <TeamCalendarView />
      </Suspense>
    </div>
  );
}

function TeamCalendarLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-[800px] w-full rounded-xl" />
    </div>
  );
}