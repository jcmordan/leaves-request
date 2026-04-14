import { redirect } from "@/i18n/navigation";

export default function Home() {
  redirect({ href: `/requests/me`, locale: "es" });
}
