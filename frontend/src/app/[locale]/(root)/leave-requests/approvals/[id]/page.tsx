import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PreloadQuery } from "@/lib/apollo-client";
import { GET_APPROVAL_DETAIL_QUERY } from "./graphql/ApprovalQueries";
import ApprovalView from "./components/ApprovalView";
import { XCircle } from "lucide-react";

interface ApprovalDetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

const ApprovalDetailPageSkeleton = async () => {
  const t = await getTranslations("requests");
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant/50">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest">
          {t("loading")}
        </p>
      </div>
    </div>
  );
};

export default async function ApprovalDetailPage({
  params,
}: ApprovalDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("requests");

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-on-surface-variant/60">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-error/50" />
          <p className="text-sm font-bold">{t("requestIdMissing")}</p>
        </div>
      </div>
    );
  }

  return (
    <PreloadQuery query={GET_APPROVAL_DETAIL_QUERY} variables={{ id }}>
      <Suspense fallback={<ApprovalDetailPageSkeleton />}>
        <ApprovalView />
      </Suspense>
    </PreloadQuery>
  );
}
