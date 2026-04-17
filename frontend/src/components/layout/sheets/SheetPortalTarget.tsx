import React, { useEffect, useRef } from "react";
import { useSheets } from "./SheetNavigation";

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
  const { setPortalTarget } = useSheets();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setPortalTarget(ref.current);
    }
    return () => {
      setPortalTarget(null);
    };
  }, [setPortalTarget]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
