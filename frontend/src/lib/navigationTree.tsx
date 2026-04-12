import { IconHome } from "@tabler/icons-react";

import { Module } from "@/types/navigation";

type TranslationFunction = (key: string) => string;

/**
 * Navigation tree configuration.
 *
 * Add your modules and submodules here.
 * Each module appears in the sidebar; submodules appear in the secondary nav bar.
 *
 * Example:
 * {
 *   id: 'dashboard',
 *   name: t('modules.dashboard'),
 *   url: '/dashboard',
 *   icon: <IconDashboard size={26} />,
 *   subModules: [
 *     {
 *       id: 'dashboard::analytics',
 *       name: t('modules.analytics'),
 *       url: '/dashboard/analytics',
 *       icon: <IconChartBar />,
 *     },
 *   ],
 * }
 */
export const getNavigationTree = (t: TranslationFunction): Module[] => {
  return [
    {
      id: "home",
      name: t("modules.home"),
      url: "/",
      icon: <IconHome size={26} />,
      subModules: [],
    },
  ];
};
