"use client";

import { usePathname } from "next/navigation";
import { FC, ReactNode, useEffect, useRef } from "react";

import { useNavigation } from "@/contexts/NavigationContext";

import { SidebarInset, SidebarProvider, useSidebar } from "../ui/sidebar";

import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSideBar";
import Footer from "./Footer";
import { ModuleNavBar } from "./ModuleNavBar";
import { SheetPortalTarget } from "./sheets/SheetPortalTarget";

interface LayoutProps {
  children: ReactNode;
}

const ModuleNavBarWrapper = ({
  selectedModule,
}: {
  selectedModule: NonNullable<
    ReturnType<typeof useNavigation>["selectedModule"]
  >;
}) => {
  const { setOpen } = useSidebar("module-nav-bar");
  const previousModuleId = useRef<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (
      previousModuleId.current === null ||
      selectedModule.id !== previousModuleId.current
    ) {
      previousModuleId.current = selectedModule.id;
      if (!pathname.includes("/analytics")) {
        setOpen(true);
      }
    }
    // Only want this to trigger when the module changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule.id, setOpen]);

  return <ModuleNavBar selectedModule={selectedModule} />;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const { selectedModule } = useNavigation();
  const hasSubmodules =
    selectedModule?.subModules && selectedModule.subModules.length > 0;

  return (
    <div>
      <SidebarProvider defaultOpen={false} sidebarIconWidth="4rem">
        {hasSubmodules && selectedModule && (
          <ModuleNavBarWrapper selectedModule={selectedModule} />
        )}
        <AppSidebar className="z-20" />
        <SidebarInset>
          <div className="flex h-screen bg-gray-100">
            <div className="flex flex-col flex-1 overflow-hidden">
              <AppHeader />
              <SheetPortalTarget className="relative flex-1 flex flex-col overflow-hidden">
                <main
                  className="flex-1 p-6 pr-2 overflow-y-auto scroll-smooth print:p-0"
                  style={{ scrollbarGutter: "stable" }}
                >
                  {children}
                </main>
              </SheetPortalTarget>
              <Footer />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
