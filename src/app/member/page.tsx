import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MemberPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Member Dashboard</h1>
      <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-8">
        Welcome, {session.user?.name}! You are signed in as <b>{session.user?.role}</b>.
      </p>

      <div className="space-y-3">
        <Link href="/member/posts" className="text-primary hover:underline">
          Manage your blog posts
        </Link>
        <Link href="/member/projects" className="text-primary hover:underline">
          Manage your projects
        </Link>
      </div>
    </main>
  );
}
