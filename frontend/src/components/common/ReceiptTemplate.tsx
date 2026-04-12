import { format } from "date-fns";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { Activity, forwardRef } from "react";

import { OrgInfoConfig, PrintConfig } from "@/types/tenant";

interface ReceiptTemplateProps {
  organization?: OrgInfoConfig | null;
  config?: PrintConfig | null;
  logoUrl?: string | null;
  tenantName: string;
  date: Date | string;
  children: React.ReactNode;
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ organization, config, logoUrl, tenantName, date, children }, ref) => {
    const t = useTranslations("common.receipt");
    const showLogo = config?.showLogo ?? true;
    const formattedDate = date instanceof Date ? format(date, "PPP p") : date;

    return (
      <div
        ref={ref}
        className="p-8 max-w-[80mm] mx-auto bg-white text-sm font-mono text-black print:max-w-full"
      >
        {/* Header */}
        <div className="text-center border-b pb-4 mb-2 border-dashed border-gray-300">
          {showLogo && logoUrl && (
            <div className="flex justify-center mb-2">
              <Image
                src={logoUrl}
                alt={tenantName}
                width={64}
                height={64}
                className="object-contain"
                unoptimized // For external URLs often used in receipts/demos
              />
            </div>
          )}
          <h1 className="text-lg font-bold">{tenantName}</h1>
          {organization?.address && (
            <div className="text-xs mt-1">{organization.address}</div>
          )}
          {organization?.phoneNumber && (
            <div className="text-xs">{organization.phoneNumber}</div>
          )}
          {organization?.taxId && (
            <div className="text-xs mt-1">
              {t("taxId")}: {organization.taxId}
            </div>
          )}
          <div className="text-xs mt-1">
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="mb-6 pb-2 border-b border-dashed border-gray-300">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-6">
          <Activity mode={config?.footerMessage ? "visible" : "hidden"}>
            <p className="mb-2 italic">{config?.footerMessage}</p>
          </Activity>
          <Activity mode={config?.footerMessage ? "hidden" : "visible"}>
            <p className="text-[10px] text-gray-500">{t("thankYou")}</p>
          </Activity>
        </div>
      </div>
    );
  },
);

ReceiptTemplate.displayName = "ReceiptTemplate";
