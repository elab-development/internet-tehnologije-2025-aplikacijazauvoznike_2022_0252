"use client";

import { useEffect, useMemo, useState } from "react";
import OfferCard, { SupplierOfferDto } from "@/components/OfferCard";


type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

export default function SupplierOffersPage() {
  const [offers, setOffers] = useState<SupplierOfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return offers;

  return offers.filter((o) => {
    return (
      o.code.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      (o.description ?? "").toLowerCase().includes(q) ||
      (o.categoryName ?? "").toLowerCase().includes(q)
    );
  });
}, [offers, query]);


  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/supplier/offers", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? `GET failed (${res.status})`);
      }

      setOffers((data ?? []) as SupplierOfferDto[]);
    } catch (e: any) {
      setError(e?.message ?? "Greška pri učitavanju ponuda");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = confirm("Da li sigurno želiš da obrišeš ovu ponudu?");
    if (!ok) return;

    const prev = offers;
    setDeletingId(id);
    setOffers((cur) => cur.filter((o) => o.id !== id));

    try {
      const res = await fetch(`/api/supplier/offers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? `DELETE failed (${res.status})`);
      }
    } catch (e: any) {
      setOffers(prev);
      alert(e?.message ?? "Greška pri brisanju");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const role: Role = "SUPPLIER";

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="md:flex">

        <section className="flex-1 p-6">
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Offers</h1>
              <p className="mt-1 text-sm text-gray-600">
                List of your bids published as a supplier.
              </p>
            </div>

          </div>

          
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-medium text-gray-900">{offers.length}</span>
                {query.trim() ? (
                  <>
                    {" "}
                    | Shown:{" "}
                    <span className="font-medium text-gray-900">
                      {filtered.length}
                    </span>
                  </>
                ) : null}
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by code, name, category, description..."
                className="
                  w-full md:w-96
                  rounded-xl border
                  px-3 py-2 text-sm
                  text-gray-900
                  placeholder:text-gray-500
                  outline-none
                  focus:ring-2 focus:ring-black/10
                "
              />
            </div>
          </div>

         
          {loading && (
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm text-gray-700">
              Loading...
            </div>
          )}

          {!loading && error && (
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-red-700 font-medium">Greška</div>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm text-gray-700">
              There are no offers to display.
            </div>
          )}

          
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((o) => (
                <OfferCard
                  key={o.id}
                  offer={o}
                  deleting={deletingId === o.id}
                  onDelete={() => handleDelete(o.id)}
                />
              ))}

            </div>
          )}
        </section>
      </div>
    </main>
  );
}


