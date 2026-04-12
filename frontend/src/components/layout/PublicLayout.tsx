import { FC, ReactNode } from "react";

import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
