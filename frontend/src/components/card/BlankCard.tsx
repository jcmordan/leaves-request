import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * BlankCard Props
 */
interface BlankCardProps {
  /** Optional title displayed in the header */
  title?: string;
  /** Optional description displayed below the title */
  description?: string;
  /** Optional Lucide icon displayed in the header action slot */
  icon?: LucideIcon;
  /** Card content elements */
  children: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Additional CSS classes for the Card container */
  className?: string;
  /** Additional CSS classes for the inner content container */
  contentClassName?: string;
}

/**
 * A generic card component leveraging atomic UI components.
 * It provides a structured layout with a header, content area, and optional footer,
 * all pre-configured with the design system tokens.
 */
const BlankCard = ({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
  contentClassName,
}: BlankCardProps) => {
  return (
    <Card
      className={cn(
        "border-none bg-surface-container-lowest shadow-ambient overflow-hidden py-0 gap-0",
        className,
      )}
    >
      {(title || description || Icon) && (
        <CardHeader className="p-8 pb-0">
          {title && (
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              {title}
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
          {Icon && (
            <CardAction>
              <Icon className="h-5 w-5 text-tertiary/50" />
            </CardAction>
          )}
        </CardHeader>
      )}

      <CardContent className={cn("p-8 gap-x-12 gap-y-8", contentClassName)}>
        {children}
      </CardContent>

      {footer && (
        <CardFooter className="p-8 pt-0 border-t-0 bg-transparent">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default BlankCard;
