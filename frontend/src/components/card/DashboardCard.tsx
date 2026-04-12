import { ComponentProps, type JSX } from "react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardContent,
  CardTitle,
  CardAction,
} from "@/components/ui/card";

type Props = Omit<ComponentProps<typeof Card>, "title" | "subtitle"> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: JSX.Element;
  footer?: JSX.Element;
  children?: React.ReactNode;
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  className,
  ...props
}: Props) => {
  return (
    <Card className={`pl-2 ${className ?? ""}`} {...props}>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export default DashboardCard;
