import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * Props for the EmployeeAvatar component
 */
interface EmployeeAvatarProps {
  /** Full name of the employee to get initials from */
  fullName: string;
  /** Optional class name for the outer container */
  className?: string;
  /** Optional class name for the avatar div */
  avatarClassName?: string;
  /** Optional children, typically a Badge component */
  children?: React.ReactNode;
}

/**
 * Reusable Employee Avatar component that displays initials and an optional badge.
 */
export function EmployeeAvatar({
  fullName,
  className,
  avatarClassName,
  children,
}: Readonly<EmployeeAvatarProps>) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-32 w-32 items-center justify-center rounded-2xl bg-primary text-4xl font-black text-white shadow-xl",
          avatarClassName,
        )}
      >
        {getInitials(fullName)}
      </div>
      {children}
    </div>
  );
}
