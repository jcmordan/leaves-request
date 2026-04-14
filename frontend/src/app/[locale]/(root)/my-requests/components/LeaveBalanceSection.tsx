import { MyBalanceFragmentFragment } from "@/__generated__/graphql";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FragmentType, useFragment } from "@/__generated__";
import { MY_BALANCE_FRAGMENT } from "../graphql/MyRequestsQueries";
import { IconWallet } from "@tabler/icons-react";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";
import { Button } from "@/components/ui/button";

interface LeaveBalanceSectionProps {
  balanceRef: FragmentType<typeof MY_BALANCE_FRAGMENT>;
}

/**
 * LeaveBalanceSection Component
 * Displays the user's current leave balance with structural tonal transitions.
 * Adheres to the "No-Line" rule and utilizes brand gradients for primary CTAs.
 */
export function LeaveBalanceSection({ balanceRef }: LeaveBalanceSectionProps) {
  const t = useTranslations("requests");
  const params = useParams();
  const balance = useFragment(MY_BALANCE_FRAGMENT, balanceRef);
  const { openSheet } = useSheets();

  const locale = params.locale as string;
  const { totalEntitlement, taken, remaining } = balance;
  const currentYear = new Date().getFullYear();
  const lastUpdated = "Oct 24, 2023"; // TODO: Fetch from actual data if available

  const handleNewRequest = () => {
    openSheet(
      "SubmitAbsentRequestSheet",
      {},
      {
        width: "lg",
      },
    );
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col border border-surface-container/50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-sm font-bold text-primary font-headline uppercase tracking-wider">
            {t("leaveBalance")} {currentYear}
          </h4>
          <p className="text-[10px] text-on-surface-variant mt-1">
            {t("updatedAsOf", { date: lastUpdated })}
          </p>
        </div>
        <div className="w-10 h-10 bg-surface-container-low flex items-center justify-center rounded-lg">
          <span className="material-symbols-outlined text-secondary text-xl">
            <IconWallet />
          </span>
        </div>
      </div>

      <div className="space-y-8 flex-1 flex flex-col justify-center">
        {/* Annual Vacation Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold font-body">
            <span className="text-on-surface">{t("annualLeave")}</span>
            <span className="text-primary">
              {taken} / {totalEntitlement} {t("days")}
            </span>
          </div>
          <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(taken / totalEntitlement) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Taken & Remaining Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low/30 p-4 rounded-xl flex flex-col gap-1 border border-surface-container/30">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-headline">
              {t("taken")}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary tracking-tighter">
                {taken < 10 ? `0${taken}` : taken}
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant/40 lowercase">
                {t("days")}
              </span>
            </div>
          </div>
          <div className="bg-secondary/5 p-4 rounded-xl flex flex-col gap-1 border border-secondary/10">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest font-headline">
              {t("remaining")}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-secondary tracking-tighter">
                {remaining < 10 ? `0${remaining}` : remaining}
              </span>
              <span className="text-[10px] font-bold text-secondary/40 lowercase">
                {t("days")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full h-12 bg-linear-to-br from-primary to-primary-container text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity uppercase tracking-widest"
        variant="default"
        size="lg"
        onClick={handleNewRequest}
      >
        <Plus className="w-4 h-4" />
        {t("newRequest")}
      </Button>
    </div>
  );
}
