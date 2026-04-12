"use client";

import { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut,
  Calendar,
  Clock,
  Users,
  Building2,
  UserCircle,
  ClockPlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";
import { SheetPortalTarget } from "@/components/layout/sheets/SheetPortalTarget";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tLayout = useTranslations("layout");
  const tRoles = useTranslations("roles");

  const getNavigation = () => {
    const baseNav = [
      { name: t("myRequests"), href: "/my-requests", icon: Clock },
      { name: t("requests"), href: "/requests", icon: ClockPlusIcon },
      { name: t("employees"), href: "/employees", icon: UserCircle },
    ];

    if (user?.role === "Supervisor") {
      baseNav.push(
        { name: t("teams"), href: "/team", icon: Users },
        { name: t("approvals"), href: "/approvals", icon: Calendar },
      );
    }

    if (user?.role === "HR_Admin" || user?.role === "Coordinator") {
      baseNav.push(
        { name: t("allRequests"), href: "/requests/all", icon: Building2 },
        { name: t("employees"), href: "/employees", icon: Users },
      );
    }

    return baseNav;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen flex w-full bg-surface-container-low text-foreground font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-sidebar-primary text-white flex flex-col shadow-ambient z-40 transition-all duration-300">
        <div className="p-8 mb-4">
          <Logo />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-4 px-6 py-3.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-surface-variant/15 text-white"
                    : "text-on-primary-container hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Active Indicator Vertical Pill */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary rounded-r-full shadow-[0_0_16px_rgba(72,104,0,0.4)] transition-all" />
                )}

                <Icon
                  className={`h-5 w-5 transition-colors ${isActive ? "text-secondary" : "group-hover:text-white"}`}
                />
                <span className="text-xs font-bold uppercase tracking-[0.12em]">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary-container/40">
          v0.1.0-beta / refidomsa corp
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* TopAppBar */}
        <header className="h-20 bg-surface-container-lowest flex items-center justify-between px-10 z-30 border-b border-outline-variant/15 sticky top-0">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black text-primary font-heading tracking-tight">
              {tLayout("workspace")}
            </span>
          </div>

          <div className="flex items-center gap-8">
            {/* User Indicator Badge */}
            <div className="flex items-center gap-4 pr-6 border-r border-outline-variant/15">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-primary tracking-tight leading-none mb-1">
                  {user?.name}
                </span>
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[9px] font-black uppercase tracking-widest rounded-full">
                  {user?.role
                    ? tRoles(user.role.toLowerCase())
                    : tRoles("employee")}
                </span>
              </div>
              <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold border border-secondary/20 shadow-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>

            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-error hover:bg-error-container/20 p-2 h-auto rounded-full transition-all"
              onClick={logout}
              title={tLayout("signout")}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Workspace Content Area */}
        <SheetPortalTarget className="flex-1 relative flex flex-col overflow-hidden">
          <main className="flex-1 p-12 overflow-y-auto bg-surface-container-low/30">
            <div className="max-w-7xl mx-auto">
              {/* Contextual Breadcrumb Path */}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-8">
                {tLayout("breadcrumb")} /{" "}
                {navigation.find(
                  (n) => pathname === n.href || pathname.startsWith(n.href),
                )?.name || t("dashboard")}
              </p>
              {children}
            </div>
          </main>
        </SheetPortalTarget>
      </div>
    </div>
  );
}
