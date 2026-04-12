"use client";

import { ReactNode } from "react";

import { usePermissions } from "@/hooks/usePermissions";

type ProtectedComponentProps = {
  permission?: string;
  module?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export function ProtectedComponent({
  permission,
  module,
  fallback = null,
  children,
}: ProtectedComponentProps) {
  const { hasPermission, hasModule, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
  }

  if (module) {
    if (!hasModule(module)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
