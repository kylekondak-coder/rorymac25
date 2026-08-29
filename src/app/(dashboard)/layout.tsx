import Link from "next/link";
import { logout } from "../(auth)/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-paper-raised">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/buildings" className="font-serif text-xl text-green-700">
            Papertrail
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/buildings" className="hover:text-green-700">
              Buildings
            </Link>
            <Link href="/schedule" className="hover:text-green-700">
              Schedule
            </Link>
            <span className="text-ink-soft">{user?.email}</span>
            <form action={logout}>
              <button type="submit" className="btn btn-secondary !py-1.5 !px-3">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}
