import { FileText, User, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { FragmentType, useFragment } from "@/__generated__";
import { REQUEST_DETAIL_FRAGMENT } from "../graphql/RequestDetailsQueries";

interface MedicalDetailsSectionProps {
  requestRef: FragmentType<typeof REQUEST_DETAIL_FRAGMENT>;
}

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);

  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

/**
 * Displays medical details (diagnosis, treating doctor, attachments).
 * Returns null when no medical data is present.
 */
export function MedicalDetailsSection({
  requestRef,
}: MedicalDetailsSectionProps) {
  const t = useTranslations("requests");
  const request = useFragment(REQUEST_DETAIL_FRAGMENT, requestRef);

  const { diagnosis, treatingDoctor, attachments } = request;
  const hasMedicalData = diagnosis || treatingDoctor || (attachments && attachments.length > 0);

  if (!hasMedicalData) {
    return null;
  }

  return (
    <div className="content-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-primary shadow-ambient">
          <FileText className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-primary font-heading">
          {t("medicalTitle")}
        </h3>
      </div>

      <div className="space-y-6">
        {diagnosis && (
          <div>
            <p className="label-sm mb-1">
              {t("diagnosis")}
            </p>
            <p className="text-sm text-on-surface leading-relaxed font-medium">
              {diagnosis}
            </p>
          </div>
        )}

        {treatingDoctor && (
          <div>
            <p className="label-sm mb-1">
              {t("treatingDoctor")}
            </p>
            <p className="text-sm font-bold text-primary flex items-center gap-2">
              <User className="h-4 w-4 shrink-0" />
              {treatingDoctor}
            </p>
          </div>
        )}

        {attachments && attachments.length > 0 && (
          <div className="pt-6">
            <p className="label-sm mb-4">
              {t("medicalEvidence")}
            </p>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-4 bg-surface rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group"
                >
                  <FileText className="h-5 w-5 text-secondary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary truncate">
                      {attachment.fileName}
                    </p>
                    {attachment.fileSize && (
                      <p className="text-[9px] text-on-surface-variant/50">
                        {formatFileSize(attachment.fileSize)} &bull; Verified
                      </p>
                    )}
                  </div>
                  <Download className="h-4 w-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
