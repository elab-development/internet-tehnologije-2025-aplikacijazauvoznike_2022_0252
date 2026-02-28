"use client";

import { useEffect, useRef, useState } from "react";
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

  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  const offsetRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [openNewOffer, setOpenNewOffer] = useState(false);
  const [openCollab, setOpenCollab] = useState(false);

  useEffect(() => {
    async function initTime() {
      try {
        const res = await fetch("/api/time", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        const externalTime = data.externalTime;
        const serverNow = data.serverNow;

        offsetRef.current = externalTime - serverNow;

        function updateTime() {
          const now = new Date(Date.now() + offsetRef.current);
          setCurrentDateTime(now);
        }

        updateTime();

        const now = new Date(Date.now() + offsetRef.current);
        const seconds = now.getSeconds();
        const delay = (60 - seconds) * 1000;

        timeoutRef.current = setTimeout(() => {
          updateTime();
          intervalRef.current = setInterval(updateTime, 60000);
        }, delay);
      } catch (err) {
        console.error("Time init failed");
      }
    }

    initTime();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

 
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

  const displayName = user.companyName?.trim()
    ? user.companyName
    : user.email;

  const formattedDate = currentDateTime?.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentDateTime?.toLocaleTimeString("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="md:flex">
        <section className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>

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

            <div className="flex flex-col items-end text-right">
              <div className="text-sm text-gray-500">
                {formattedDate || "Loading date..."}
              </div>

              <div className="text-3xl font-semibold text-gray-900 tracking-tight">
                {formattedTime || "--:--"}
              </div>

            </div>
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

                <DashboardCard
                  title="Containers"
                  desc="Overview of all containers"
                  href="/importer/containers"
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

                <DashboardCard
                  title="Product categories"
                  desc="List of product categories"
                  href="/supplier/productCategories"
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