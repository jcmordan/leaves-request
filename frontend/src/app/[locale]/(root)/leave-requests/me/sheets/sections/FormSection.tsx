import { cn } from "@/lib/utils";

/**
 * A reusable wrapper for form sections with a title and an accent bar.
 */
export const FormSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-outline-variant/10">
      <span className="w-1 h-4 bg-secondary rounded-full" />
      <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/60">
        {title}
      </h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);
