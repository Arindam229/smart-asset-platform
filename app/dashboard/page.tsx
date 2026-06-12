import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";



export default async function DashboardIndexPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  redirect(session.user.role === "Admin" ? "/dashboard/admin/inventory" : "/dashboard/consumer");
}
