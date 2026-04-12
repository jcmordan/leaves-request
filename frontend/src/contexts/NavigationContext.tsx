"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePermissions } from "@/hooks/usePermissions";
import { getNavigationTree } from "@/lib/navigationTree";
import { Module } from "@/types/navigation";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  isUrgent?: boolean;
  href: string | null;
  // Extended properties for specific modules
  type?: string;
  createdAt?: string;
  metadata?: Record<string, string>;
  onClick?: () => void;
  onDismiss?: () => void;
}

interface NavigationContextProps {
  selectedModule: Module | null;
  setSelectedModule: (module: Module | null) => void;
  modules: Module[];
  notifications: NotificationItem[];
  setNotifications: (notifications: NotificationItem[]) => void;
  loading: boolean;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(
  undefined,
);

export const NavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [manualSelection, setManualSelection] = useState<Module | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const t = useTranslations();
  const tRef = useRef(t);
  tRef.current = t;
  const {
    hasModule,
    hasModulePermission,
    loading: permissionsLoading,
  } = usePermissions();

  // ... (existing code: stableT, allModules, modules memo) ...
  const stableT = useCallback((key: string) => tRef.current(key), []);

  const allModules = useMemo(() => getNavigationTree(stableT), [stableT]);

  const modules = useMemo(() => {
    return allModules.filter((module) => {
      // Always show home module, even during loading
      if (module.id === "home") {
        return true;
      }

      // While permissions are loading, hide other modules
      if (permissionsLoading) {
        return false;
      }

      // Filter modules based on permissions
      const hasModuleAccess = hasModule(module.id);

      if (!hasModuleAccess) {
        return false;
      }

      module.subModules = module.subModules?.filter((subModule) => {
        return subModule.whiteListed ?? hasModulePermission(subModule.id);
      });

      return true;
    });
  }, [allModules, hasModule, hasModulePermission, permissionsLoading]);

  useEffect(() => {
    if (permissionsLoading) {
      setLoading(true);

      return;
    }

    if (manualSelection) {
      setSelectedModule(manualSelection);
      setLoading(false);

      return;
    }

    const [matchedModule] = modules
      .filter((module) => {
        if (pathname === module.url) {
          return true;
        }

        return pathname.startsWith(`${module.url}/`);
      })
      .sort((a, b) => b.url.length - a.url.length);

    if (matchedModule) {
      setSelectedModule(matchedModule);
    } else {
      setSelectedModule(null);
    }

    setLoading(false);
  }, [pathname, modules, manualSelection, permissionsLoading]);

  const handleSetSelectedModule = (module: Module | null) => {
    setManualSelection(module);
    setSelectedModule(module);
  };

  return (
    <NavigationContext.Provider
      value={{
        selectedModule,
        setSelectedModule: handleSetSelectedModule,
        modules,
        notifications,
        setNotifications,
        loading,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
};
