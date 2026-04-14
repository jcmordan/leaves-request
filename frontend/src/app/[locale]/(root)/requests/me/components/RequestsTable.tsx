import { ListFilter, X, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { PaginatedDataTable } from "@/components/ui/paginated-data-table";
import { useRequestColumns, RequestItem } from "./RequestColumns";
import { FragmentType, useFragment } from "@/__generated__";
import { MY_REQUESTS_CONNECTION_FRAGMENT } from "../graphql/MyRequestsQueries";
import { RequestStatus } from "@/__generated__/graphql";
import { EmptyState } from "@/components/ui/empty-state";
import { CancelRequestModal } from "@/components/requests/CancelRequestModal";

interface RequestsTableProps {
  requestsRef?: FragmentType<typeof MY_REQUESTS_CONNECTION_FRAGMENT> | null;
}

/**
 * RequestsTable Component
 * Displays the recent activity of leave requests in a paginated data table.
 */
export function RequestsTable({ requestsRef }: RequestsTableProps) {
  const t = useTranslations("requests");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null,
  );

  const handleCancelClick = (request: RequestItem) => {
    setSelectedRequest(request);
    setIsCancelModalOpen(true);
  };

  const requests = useFragment(MY_REQUESTS_CONNECTION_FRAGMENT, requestsRef);
  const columns = useRequestColumns(handleCancelClick);

  const nodes = requests?.nodes || [];

  const statusParam = searchParams.get("status");
  const currentStatus = Object.values(RequestStatus).includes(
    statusParam?.toUpperCase() as RequestStatus,
  )
    ? (statusParam?.toUpperCase() as RequestStatus)
    : undefined;

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("after");
    params.delete("before");
    router.push(`${pathname}?${params.toString()}`);
  };

  const statusColors: Record<RequestStatus, string> = {
    [RequestStatus.Pending]:
      "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
    [RequestStatus.PendingCoordinatorApproval]:
      "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
    [RequestStatus.Approved]:
      "bg-secondary-container/30 text-secondary border-secondary/20",
    [RequestStatus.Rejected]:
      "bg-error-container/30 text-error border-error/20",
    [RequestStatus.Cancelled]: "bg-outline/10 text-outline border-outline/20",
    [RequestStatus.ModificationRequested]:
      "bg-surface-tint/10 text-surface-tint border-surface-tint/20",
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container/50">
      {/* Table Toolbar */}
      <div className="px-8 py-6 flex justify-between items-center bg-white border-b border-surface-container/50">
        <h4 className="text-sm font-extrabold text-primary font-headline uppercase tracking-wider">
          {t("recentActivity")}
        </h4>
        <div className="flex items-center gap-3">
          {currentStatus && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight ${statusColors[currentStatus]}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {t(currentStatus.toLowerCase())}
              </div>
              <button
                onClick={handleClear}
                className="group flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/60 hover:text-error transition-all"
              >
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
                  {t("clearFilters")}
                </span>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {!currentStatus && (
            <div className="flex items-center gap-2 text-on-surface-variant/40">
              <ListFilter className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {t("noFilters")}
              </span>
            </div>
          )}
        </div>
      </div>

      {nodes.length === 0 && (
        <EmptyState
          title={t("emptyStateTitle")}
          // description={t("emptyStateDescription")}
          icon={Search}
          // secondaryIcon={User}
          // action={
          //   onClearSearch
          //     ? {
          //         label: t("clearSearch"),
          //         onClick: onClearSearch,
          //         icon: RotateCcw,
          //       }
          //     : undefined
          // }
        />
      )}

      {nodes.length > 0 && (
        <PaginatedDataTable
          columns={columns}
          data={nodes as any}
          pageInfo={requests?.pageInfo}
          density="comfortable"
          emptyMessage={t("noActivity")}
          className="w-full h-full"
          containerClassName="flex flex-col flex-1"
        />
      )}

      <CancelRequestModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        requestRef={selectedRequest}
      />
    </div>
  );
}
