import { MessageSquareQuote } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { APPROVAL_REQUEST_FIELDS_FRAGMENT } from "../graphql/ApprovalQueries";

interface RequesterCommentsCardProps {
  requestRef: FragmentType<typeof APPROVAL_REQUEST_FIELDS_FRAGMENT>;
}

/**
 * RequesterCommentsCard component - Displays the comments provided by the employee during submission.
 */
export function RequesterCommentsCard({ requestRef }: RequesterCommentsCardProps) {
  const t = useTranslations("requests");
  const request = useFragment(APPROVAL_REQUEST_FIELDS_FRAGMENT, requestRef);

  if (!request || !request.reason) return null;

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm animate-in fade-in duration-500 delay-75">
      <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-4 font-heading">
        {t("employeeComment")}
      </h2>
      
      <div className="flex gap-4">
   
        <div className="relative pt-1 w-full">
          <span className="absolute -left-2 -top-1 text-3xl text-primary/10 font-serif leading-none">
            &ldquo;
          </span>
          <p className="text-on-surface-variant leading-relaxed text-sm font-medium italic bg-muted p-2 rounded-lg min-h-14">
            {request.reason}
          </p>
        </div>
      </div>
    </section>
  );
}
