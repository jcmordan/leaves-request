import { redirect } from "@/i18n/navigation";

export default function Home() {
  redirect({ href: `/my-requests`, locale: "es" });
}
