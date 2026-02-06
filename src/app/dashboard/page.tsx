"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NewOfferModal from "@/components/NewOfferModal";
import CreateCollaborationModal from "@/components/CreateCollaborationModal";
import DashboardCard from "@/components/DashboardCard";
import DashboardActionCard from "@/components/DashboardActionCard";

type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

type User = {
  email: string;
  role: Role;
  companyName?: string | null;
  country?: string | null;
  address?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [openNewOffer, setOpenNewOffer] = useState(false);
  const [openCollab, setOpenCollab] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.user) {
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setUser({
            email: data.user.email,
            role: data.user.role,
            companyName: data.user.companyName,
            country: data.user.country,
            address: data.user.address,
          });
        }
      } catch {
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.replace("/login");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700">Loading...</div>
      </main>
    );
  }

  if (!user) return null;

  const displayName = user.companyName?.trim() ? user.companyName : user.email;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="md:flex">

        <section className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

              <p className="mt-1 text-sm text-gray-600">
                You are logged in as{" "}
                <span className="font-medium">{displayName}</span>
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Role: <span className="font-medium">{user.role}</span>
              </p>

              {user.companyName && (
                <p className="mt-1 text-sm text-gray-600">
                  Location:{" "}
                  <span className="font-medium">
                    {user.country ?? "—"}
                    {user.address ? `, ${user.address}` : ""}
                  </span>
                </p>
              )}
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
                <DashboardCard
                  title="Users"
                  desc="User management"
                  href="/admin/users"
                />

                <DashboardActionCard
                  title="Create a collaboration"
                  desc="Create a collaboration importer–supplier"
                  onClick={() => setOpenCollab(true)}
                />

                <DashboardCard
                  title="All Collaborations"
                  desc="View all collaborations"
                  href="/admin/collaborations"
                />
              </>
            )}

            {user.role === "IMPORTER" && (
              <>
                <DashboardCard
                  title="Offers"
                  desc="Overview of offers"
                  href="/importer/offers"
                />
              </>
            )}

            {user.role === "SUPPLIER" && (
              <>
                <DashboardCard
                  title="My Offers"
                  desc="List of your offers"
                  href="/supplier/offers"
                />

                <DashboardActionCard
                  title="New Offer"
                  desc="Create a new offer"
                  onClick={() => setOpenNewOffer(true)}
                />
              </>
            )}
          </div>

          <NewOfferModal
            open={openNewOffer}
            onClose={() => setOpenNewOffer(false)}
            onCreated={() => {
              router.push("/supplier/offers");
            }}
          />

          <CreateCollaborationModal
            open={openCollab && user.role === "ADMIN"}
            onClose={() => setOpenCollab(false)}
          />
        </section>
      </div>
    </main>
  );
}