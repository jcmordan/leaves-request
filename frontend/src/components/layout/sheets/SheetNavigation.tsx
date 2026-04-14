"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ComponentType,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { SheetPortalProvider } from "./SheetPortalContext";
import Sheets, { SheetName } from "./sheets";

// Type definition for PointerDownOutsideEvent
type PointerDownOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent;
}>;

type SheetProps<N extends SheetName> =
  (typeof Sheets)[N] extends ComponentType<infer P> ? P : never;

type SheetOptions = {
  width?: "sm" | "md" | "lg" | "xl" | "full" | string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

const sheetContext = createContext<{
  closeSheet: () => void;
  openSheet: <N extends SheetName>(
    sheetName: N,
    params: SheetProps<N>,
    options?: SheetOptions,
  ) => void;
  setOptions: (options: SheetOptions) => void;
  sheetOptions: SheetOptions;
}>({
  closeSheet: () => ({}),
  openSheet: () => ({}),
  setOptions: () => ({}),
  sheetOptions: {},
});

export const useSheets = () => {
  const context = useContext(sheetContext);

  if (context === undefined) {
    throw new Error("useSheets must be used within a SheetProvider");
  }

  return context;
};

export const useSheetParams = () => {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const sheetName = searchParams.get("sheetName") as SheetName | null;
    const sheetParamsStr = searchParams.get("sheetParams");
    const sheetWidth = searchParams.get("sheetWidth") as SheetOptions["width"];
    const sheetSide = searchParams.get("sheetSide") as SheetOptions["side"];
    const sheetClassName = searchParams.get("sheetClassName");

    if (!sheetName || !Sheets[sheetName]) {
      return {
        SheetComponent: null as ComponentType<any> | null,
        sheetParams: {},
        sheetOptions: {},
      };
    }

    let sheetParams = {};
    if (sheetParamsStr) {
      try {
        sheetParams = JSON.parse(sheetParamsStr);
      } catch {
        sheetParams = {};
      }
    }

    return {
      SheetComponent: Sheets[sheetName] as ComponentType<any>,
      sheetParams,
      sheetOptions: {
        width: sheetWidth,
        side: sheetSide ?? "right",
        className: sheetClassName ?? undefined,
      },
    };
  }, [searchParams]);
};

type Props = PropsWithChildren<object>;

export const SheetProvider = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { SheetComponent, sheetParams, sheetOptions } = useSheetParams();

  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const handleContainerReady = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  // Helper to build URL with search params
  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();

      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [searchParams, pathname],
  );

  const openSheet = useCallback(
    <N extends SheetName>(
      sheetName: N,
      params: SheetProps<N>,
      options: SheetOptions = { width: "md", side: "right" },
    ) => {
      const currentSheetName = searchParams.get("sheetName");
      const currentSheetParams = searchParams.get("sheetParams");

      const updates: Record<string, string | null> = {
        sheetName,
        sheetParams: JSON.stringify(params),
        sheetWidth: options?.width ?? null,
        sheetSide: options?.side ?? null,
        sheetClassName: options?.className ?? null,
      };

      if (currentSheetName) {
        updates.prevSheetName = currentSheetName;
        updates.prevSheetParams = currentSheetParams;
      } else {
        updates.prevSheetName = null;
        updates.prevSheetParams = null;
      }

      router.replace(buildUrl(updates));
    },
    [router, searchParams, buildUrl],
  );

  const setOptions = useCallback(
    (options: SheetOptions) => {
      const updates: Record<string, string | null> = {};
      if (options.width) {
        updates.sheetWidth = options.width;
      }
      if (options.side) {
        updates.sheetSide = options.side;
      }
      if (options.className) {
        updates.sheetClassName = options.className;
      }

      const newUrl = buildUrl(updates);
      const currentUrl =
        pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

      if (Object.keys(updates).length > 0 && newUrl !== currentUrl) {
        router.replace(newUrl);
      }
    },
    [router, buildUrl, pathname, searchParams],
  );

  const closeSheet = useCallback(() => {
    const prevSheetName = searchParams.get("prevSheetName");
    const prevSheetParams = searchParams.get("prevSheetParams");

    if (prevSheetName) {
      router.replace(
        buildUrl({
          sheetName: prevSheetName,
          sheetParams: prevSheetParams,
          prevSheetName: null,
          prevSheetParams: null,
          sheetWidth: null,
          sheetSide: null,
          sheetClassName: null,
        }),
      );
    } else {
      router.replace(
        buildUrl({
          sheetName: null,
          sheetParams: null,
          sheetWidth: null,
          sheetSide: null,
          sheetClassName: null,
        }),
      );
    }
  }, [router, buildUrl, searchParams]);

  const handleClickOutside = (e: PointerDownOutsideEvent) => {
    e.preventDefault();
  };

  const currentSize = useMemo(() => {
    if (!sheetOptions.width) {
      return "sm";
    }

    return ["sm", "md", "lg", "xl", "full"].includes(sheetOptions.width)
      ? (sheetOptions.width as any)
      : "auto";
  }, [sheetOptions.width]);

  const customClassName = useMemo(() => {
    const standardWidths = ["sm", "md", "lg", "xl", "full"];
    const widthClass = standardWidths.includes(sheetOptions.width || "")
      ? undefined
      : sheetOptions.width;

    return cn(widthClass, sheetOptions.className);
  }, [sheetOptions.width, sheetOptions.className]);

  return (
    <sheetContext.Provider
      value={{
        closeSheet,
        openSheet,
        setOptions,
        sheetOptions,
      }}
    >
      {children}
      <Sheet
        open={!!SheetComponent}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet();
          }
        }}
      >
        <SheetContent
          side={sheetOptions.side}
          size={currentSize}
          className={cn("p-0", customClassName)}
          onPointerDownOutside={handleClickOutside}
          onContainerReady={handleContainerReady}
        >
          <SheetPortalProvider container={container}>
            {SheetComponent && <SheetComponent {...sheetParams} />}
          </SheetPortalProvider>
        </SheetContent>
      </Sheet>
    </sheetContext.Provider>
  );
};
