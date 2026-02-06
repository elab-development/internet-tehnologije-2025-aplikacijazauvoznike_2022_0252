"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";
type User = { email: string; role: Role };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as User;
      setUser(parsed);
    } catch {
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="md:flex">
        <Sidebar role={user.role} />

        <section className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Ulogovan si kao <span className="font-medium">{user.email}</span>
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {user.role === "ADMIN" && (
              <>
                <Card title="Users" desc="Upravljanje korisnicima" href="/admin/users" />
                <Card title="Categories" desc="CRUD kategorija" href="/admin/categories" />
                <Card title="Suppliers" desc="Pregled dobavljača" href="/admin/suppliers" />
              </>
            )}

            {user.role === "IMPORTER" && (
              <>
                <Card title="Offers" desc="Pregled ponuda" href="/importer/offers" />
                <Card title="Compare" desc="Uporedi ponude" href="/importer/compare" />
                <Card title="Containers" desc="Moji kontejneri" href="/importer/containers" />
              </>
            )}

            {user.role === "SUPPLIER" && (
              <>
                <Card title="My Offers" desc="Lista tvojih ponuda" href="/supplier/offers" />
                <Card title="New Offer" desc="Kreiraj novu ponudu" href="/supplier/offers/new" />
                <Card title="Products" desc="Tvoj katalog" href="/supplier/products" />
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
      <div className="mt-4 text-sm font-medium text-black underline">Open</div>
    </a>
  );
}