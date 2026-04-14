import React from "react";

interface SheetPortalTargetProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * A component that marks the area where sheets should be rendered.
 * It automatically registers its ref with the SheetProvider to ensure
 * robust containment and avoid overlapping headers/footers.
 */
export const SheetPortalTarget = ({
  className,
  children,
}: SheetPortalTargetProps) => {
  return <div className={className}>{children}</div>;
};
