import { redirect } from "@/i18n/navigation";

export default function Home() {
  redirect({ href: `/leave-requests/me`, locale: "es" });
}
