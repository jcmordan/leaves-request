import { ReactNode } from "react";

export type NavigationItem = {
  id: string;
  name: string;
  url: string;
  icon: ReactNode;
  location?: "content" | "footer";
};

export type Module = NavigationItem & {
  subModules: SubModule[];
};

export type SubModule = NavigationItem & { whiteListed?: boolean };
