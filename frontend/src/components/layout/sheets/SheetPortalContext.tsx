"use client";

import { type ReactNode, createContext, useContext } from "react";

type SheetPortalContextValue = {
  container: HTMLDivElement | null;
};

const SheetPortalContext = createContext<SheetPortalContextValue | null>(null);

export const useSheetPortalContainer = () => {
  const context = useContext(SheetPortalContext);

  return context?.container ?? null;
};

type SheetPortalProviderProps = {
  children: ReactNode;
  container: HTMLDivElement | null;
};

export const SheetPortalProvider = ({
  children,
  container,
}: SheetPortalProviderProps) => {
  return (
    <SheetPortalContext.Provider value={{ container }}>
      {children}
    </SheetPortalContext.Provider>
  );
};
