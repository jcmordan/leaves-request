import { cn } from "@/lib/utils";

/**
 * A reusable wrapper for form sections with a title and an accent bar.
 *
 * @param {Object} props - The component props.
 * @param {string} props.title - The title of the section.
 * @param {React.ReactNode} props.children - The content of the section.
 * @param {string} [props.className] - Additional CSS classes for the container.
 * @returns {JSX.Element} The rendered FormSection component.
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
    <div className="flex items-center gap-2 mb-2 pb-4">
      <span className="w-1 h-4 bg-secondary rounded-full" />
      <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/60">
        {title}
      </h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);
