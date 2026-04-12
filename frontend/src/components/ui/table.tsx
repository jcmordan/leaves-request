"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const TableContext = React.createContext<{
  density?: "comfortable" | "standard" | "compact";
}>({
  density: "standard",
});

const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    density: {
      comfortable: "text-base",
      standard: "text-sm",
      compact: "text-xs",
    },
  },
  defaultVariants: {
    density: "standard",
  },
});

function Table({
  className,
  density = "standard",
  ...props
}: React.ComponentProps<"table"> & VariantProps<typeof tableVariants>) {
  return (
    <TableContext.Provider value={{ density }}>
      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto"
      >
        <table
          data-slot="table"
          className={cn(tableVariants({ density, className }))}
          {...props}
        />
      </div>
    </TableContext.Provider>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

const tableHeadVariants = cva(
  "text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      density: {
        comfortable: "h-14 px-4",
        standard: "h-10 px-2",
        compact: "h-8 px-1",
      },
    },
    defaultVariants: {
      density: "standard",
    },
  },
);

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const { density } = React.useContext(TableContext);
  return (
    <th
      data-slot="table-head"
      className={cn(tableHeadVariants({ density, className }))}
      {...props}
    />
  );
}

const tableCellVariants = cva(
  "align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      density: {
        comfortable: "p-4",
        standard: "p-2",
        compact: "p-1",
      },
    },
    defaultVariants: {
      density: "standard",
    },
  },
);

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { density } = React.useContext(TableContext);
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ density, className }))}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
