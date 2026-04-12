"use client";

import { isEmpty } from "lodash";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import InitialsAvatar from "react-initials-avatar";

import { NotificationBell } from "@/components/layout/NotificationBell";
import { LocaleSwitcher } from "@/components/locale/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/contexts/NavigationContext";
import { federatedLogout } from "@/lib/federatedLogout";

import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";

export const AppHeader = () => {
  const { data: session, status: _status } = useSession();
  const { selectedModule } = useNavigation();
  const t = useTranslations("header");

  const handleLogout = async () => {
    await federatedLogout();
  };

  const hasSubmodules =
    selectedModule?.subModules && selectedModule.subModules.length > 0;

  return (
    <header
      id="layout-top-bar"
      className="bg-white shadow p-4 flex justify-between items-center print:hidden"
    >
      <div className="flex items-center">
        {hasSubmodules && (
          <>
            <SidebarTrigger id="module-nav-bar" className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <NotificationBell />
        <div className="relative pr-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="rounded-lg" data-testid="user-avatar">
                <AvatarImage
                  src={
                    !isEmpty(session?.user?.image)
                      ? (session?.user.image ?? undefined)
                      : undefined
                  }
                  alt="profile avatar"
                />
                <AvatarFallback>
                  <InitialsAvatar name={session?.user?.name ?? "Anonymous"} />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-6">
              <DropdownMenuItem>
                <Link className="w-full" href="/console/profile">
                  {t("profile")}
                </Link>
              </DropdownMenuItem>
              <ThemeSwitcher />
              <LocaleSwitcher />
              <DropdownMenuItem>
                <button onClick={handleLogout}>{t("logout")}</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
