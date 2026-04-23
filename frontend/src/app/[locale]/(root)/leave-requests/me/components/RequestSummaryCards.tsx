import { RequestStatus } from "@/__generated__/graphql";
import { useTranslations } from "next-intl";
import {
  Clock,
  XCircle,
  CheckCircle,
  CircleEllipsis,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FragmentType, useFragment } from "@/__generated__";
import { MY_BALANCE_FRAGMENT } from "../graphql/MyRequestsQueries";

interface RequestSummaryCardsProps {
  myBalanceRef: FragmentType<typeof MY_BALANCE_FRAGMENT>;
}

/**
 * RequestSummaryCards Component
 * Follows the Sovereign Workspace aesthetic with left-accent borders and tonal layering.
 * Displays counts for Pending, Approved, and Rejected requests.
 */
export function RequestSummaryCards({
  myBalanceRef,
}: RequestSummaryCardsProps) {
  const t = useTranslations("requests");
  const router = useRouter();
  const pathname = usePathname();

  const myBalance = useFragment(MY_BALANCE_FRAGMENT, myBalanceRef);

  const pendingRequests = myBalance.pendingRequests;
  const approvedRequests = myBalance.approvedRequests;
  const rejectedRequests = myBalance.rejectedRequests;
  const cancelledRequests = myBalance.cancelledRequests;

  const stats = [
    {
      title: t("pending"),
      description: t("pendingDescription"),
      value: pendingRequests < 10 ? `0${pendingRequests}` : pendingRequests,
      Icon: Clock,
      iconColor: "text-surface-tint",
      bgIcon: "bg-surface-container-low",
      borderColor: "border-surface-tint",
      status: RequestStatus.Pending,
    },
    {
      title: t("approved"),
      description: t("approvedDescription"),
      value: approvedRequests < 10 ? `0${approvedRequests}` : approvedRequests,
      Icon: CheckCircle,
      iconColor: "text-secondary",
      bgIcon: "bg-secondary-container/30",
      borderColor: "border-secondary",
      fillIcon: true,
      status: RequestStatus.Approved,
    },
    {
      title: t("rejected"),
      description: t("rejectedDescription"),
      value: rejectedRequests < 10 ? `0${rejectedRequests}` : rejectedRequests,
      Icon: XCircle,
      iconColor: "text-error",
      bgIcon: "bg-error-container/30",
      borderColor: "border-error",
      status: RequestStatus.Rejected,
    },
    {
      title: t("cancelled"),
      description: t("cancelledDescription"),
      value:
        cancelledRequests < 10 ? `0${cancelledRequests}` : cancelledRequests,
      Icon: CircleEllipsis,
      iconColor: "text-outline",
      bgIcon: "bg-surface-container-low",
      borderColor: "border-outline-variant",
      status: RequestStatus.Cancelled,
    },
  ];

  const handleFilter = (status: RequestStatus) => {
    router.push(`${pathname}?status=${status}`);
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between border-l-4 ${stat.borderColor} transition-all hover:shadow-md group`}
        >
          <div className="flex justify-between items-center">
            <div
              className={`w-10 h-10 ${stat.bgIcon} flex items-center justify-center rounded-lg`}
            >
              <span
                className={`material-symbols-outlined ${stat.iconColor}`}
                style={
                  stat.fillIcon
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                <stat.Icon />
              </span>
            </div>
            <span className="text-3xl font-black text-primary font-headline tracking-tighter">
              {stat.value}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">
              {stat.title}
            </p>
            <p className="text-[10px] text-on-surface-variant/40 mt-1 font-body">
              {stat.description}
            </p>
          </div>
          <div className="divide-accent" />
          <div className="relative my-2 flex items-center">
            <div className="h-px grow bg-outline-variant opacity-20" />
          </div>
          <div className="flex justify-end">
            <Button
              variant="link"
              className="text-xs cursor-pointer"
              onClick={() => handleFilter(stat.status)}
            >
              {"View Requests"}
              <ChevronRight />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
