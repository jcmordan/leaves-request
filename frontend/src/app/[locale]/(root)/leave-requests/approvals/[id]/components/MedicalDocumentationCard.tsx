import { FileText, Download, BriefcaseMedical } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { APPROVAL_REQUEST_FIELDS_FRAGMENT } from "../graphql/ApprovalQueries";

interface MedicalDocumentationCardProps {
  requestRef: FragmentType<typeof APPROVAL_REQUEST_FIELDS_FRAGMENT>;
}

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

/**
 * MedicalDocumentationCard component - Displays medical evidence and diagnosis.
 * Returns null if no medical data is available.
 */
export function MedicalDocumentationCard({
  requestRef,
}: MedicalDocumentationCardProps) {
  const t = useTranslations("requests");
  const request = useFragment(APPROVAL_REQUEST_FIELDS_FRAGMENT, requestRef);

  if (!request) return null;

  const { diagnosis, treatingDoctor, attachments } = request;
  const hasMedicalData = diagnosis || treatingDoctor || (attachments && attachments.length > 0);

  if (!hasMedicalData) return null;

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-4 font-heading">
        {t("medicalDocumentation")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left column: Summary & Doctor */}
        <div className="space-y-6">
          {diagnosis && (
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-2">
                {t("diagnosisSummary")}
              </p>
              <p className="bg-muted text-on-surface leading-normal text-sm font-medium min-h-13 p-2 mt-5">
                {diagnosis}
              </p>
            </div>
          )}

          {treatingDoctor && (
            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg">
              <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center text-primary">
                <BriefcaseMedical className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  {t("attendingPhysician")}
                </p>
                <p className="font-headline font-extrabold text-primary">
                  {treatingDoctor}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Attachments */}
        <div className="space-y-4">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            {t("attachments")}
          </p>
          <div className="space-y-2">
            {attachments?.map((attachment) => (
              <div
                key={attachment.id}
                className="group flex items-center justify-between p-3 border border-outline-variant/15 rounded-lg hover:bg-surface-container-low transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText
                    className={`h-5 w-5 shrink-0 ${attachment.fileName.endsWith(".pdf") ? "text-error" : "text-blue-500"}`}
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-primary truncate">
                      {attachment.fileName}
                    </p>
                    {attachment.fileSize && (
                      <p className="text-[10px] text-on-surface-variant/50">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    )}
                  </div>
                </div>
                <Download className="h-4 w-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
              </div>
            ))}
            {(!attachments || attachments.length === 0) && (
              <p className="text-xs italic text-on-surface-variant/40 py-2">
                {t("noAttachments")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
