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
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";
import { SheetPortalTarget } from "@/components/layout/sheets/SheetPortalTarget";
import { useSheets } from "@/components/layout/sheets/SheetNavigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { openSheet } = useSheets();
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tLayout = useTranslations("layout");
  const tRoles = useTranslations("roles");

    const getNavigation = () => {
    const baseNav = [
      { name: t("myRequests"), href: "/leave-requests/me", icon: Clock },
    ];

    if (user?.roles.includes("Supervisor") || user?.roles.includes("Manager")) {
      baseNav.push({
        name: t("approvals"),
        href: "/leave-requests/approvals",
        icon: Calendar,
      });
      baseNav.push({ name: t("teams"), href: "/team", icon: Users });
    }

    if (
      user?.roles.includes("HR_Admin") ||
      user?.roles.includes("Coordinator") ||
      user?.roles.includes("HRManager")
    ) {
      baseNav.push({
        name: t("allRequests"),
        href: "/leave-requests/all",
        icon: Building2,
      });
      baseNav.push({ name: t("employees"), href: "/employees", icon: Users });
    }

    return baseNav;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen flex w-full bg-surface-container-low text-foreground font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-sidebar-primary text-white flex flex-col shadow-ambient z-40 transition-all duration-300 sticky top-0 h-screen overflow-y-auto">
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

        <div className="px-6 mb-4">
          <Button
            onClick={() =>
              openSheet("SubmitAbsentRequestSheet", {}, { width: "lg" })
            }
            className="w-full h-12 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 group transition-all"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            {t("newRequest")}
          </Button>
        </div>

        <div className="p-8 text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary-container/40">
          REFIDOMSA © 2026
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative">
        {/* TopAppBar */}
        <header className="h-20 bg-surface-container-lowest flex items-center justify-between px-10 z-30 border-b border-outline-variant/15 sticky top-0">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black text-primary font-heading tracking-tight">
              {tLayout("workspace")}
            </span>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-4 px-4 h-14 hover:bg-surface-variant/10 transition-all rounded-xl border border-transparent hover:border-outline-variant/30"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-primary tracking-tight leading-none mb-1">
                      {user?.name}
                    </span>
                    <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[9px] font-black uppercase tracking-widest rounded-full">
                      {user?.roles && user.roles.length > 0
                        ? tRoles(user.roles[0].toLowerCase())
                        : tRoles("employee")}
                    </span>
                  </div>
                  <Avatar className="h-10 w-10 border border-secondary/20 shadow-sm transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-secondary/10 text-secondary font-bold text-sm">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground/50 transition-transform group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-error focus:text-error focus:bg-error-container/20 cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{tLayout("signout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Workspace Content Area */}
        <SheetPortalTarget className="flex-1 relative flex flex-col">
          <main className="flex-1 p-12 bg-surface-container-low/30">
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
