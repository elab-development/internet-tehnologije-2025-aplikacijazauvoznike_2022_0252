"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";

function isProtectedPath(path: string) {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/importer") ||
    path.startsWith("/supplier")
  );
}

function isPublicPath(path: string) {
  return path === "/login" || path === "/register"; 
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  const protectedRoute = isProtectedPath(pathname);
  const publicRoute = isPublicPath(pathname);

  
  useEffect(() => {
    if (!protectedRoute) return;

    (async () => {
      const ok = await refresh();
      if (!ok) router.replace("/login");
    })();
    
  }, [protectedRoute, pathname]);

  
  if (publicRoute) return <>{children}</>;

 
  if (!protectedRoute) return <>{children}</>;

  
  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="md:flex">
        <Sidebar />
        <section className="flex-1 p-6">{children}</section>
      </div>
    </main>
  );
}
