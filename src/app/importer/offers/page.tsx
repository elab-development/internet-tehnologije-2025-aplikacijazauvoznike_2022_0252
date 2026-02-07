"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";

type ImporterOfferDto = {
  id: string;

  categoryId: string;
  categoryName: string;

  code: string;
  name: string;
  description: string | null;
  imageUrl: string;
  price: string;
  width: number;
  height: number;
  depth: number;
  createdAt: string;

  supplierId: string;
  supplierEmail: string;
  supplierCompanyName: string | null;
};

type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

function supplierLabel(o: Pick<ImporterOfferDto, "supplierEmail" | "supplierCompanyName">) {
  const name = o.supplierCompanyName?.trim();
  return name ? `${name} (${o.supplierEmail})` : o.supplierEmail;
}

export default function ImporterOffersPage() {
  const [offers, setOffers] = useState<ImporterOfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/importer/offers", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? `GET failed (${res.status})`);
      }

      setOffers((data ?? []) as ImporterOfferDto[]);
    } catch (e: any) {
      setError(e?.message ?? "Greška pri učitavanju ponuda");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Search filter, pre grupisanja
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return offers;

    return offers.filter((o) => {
      return (
        o.code.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q) ||
        (o.categoryName ?? "").toLowerCase().includes(q) ||
        supplierLabel(o).toLowerCase().includes(q)
      );
    });
  }, [offers, query]);

  // Grupisanje po supplier-u
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { supplierId: string; supplierName: string; items: ImporterOfferDto[] }
    >();

    for (const o of filtered) {
      const key = o.supplierId;
      if (!map.has(key)) {
        map.set(key, {
          supplierId: o.supplierId,
          supplierName: supplierLabel(o),
          items: [],
        });
      }
      map.get(key)!.items.push(o);
    }

    // sort grupe po imenu supplier-a
    const groups = Array.from(map.values()).sort((a, b) =>
      a.supplierName.localeCompare(b.supplierName)
    );

    // sort ponude unutar grupe po datumu (najnovije prvo)
    for (const g of groups) {
      g.items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return groups;
  }, [filtered]);


  return (
    <main className="min-h-screen bg-gray-100">
      <div className="md:flex">
        

        <section className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Offers</h1>
              <p className="mt-1 text-sm text-gray-600">
                Display of offers only from suppliers you cooperate with.
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
                placeholder="Search by code, name, category, description, supplier..."
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

          {!loading && !error && grouped.length === 0 && (
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm text-gray-700">
              There are no offers to display (or you have no cooperation).
            </div>
          )}

          {!loading && !error && grouped.length > 0 && (
            <div className="mt-6 space-y-6">
              {grouped.map((g) => (
                <div key={g.supplierId} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {g.supplierName}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Offers:{" "}
                        <span className="font-medium text-gray-900">
                          {g.items.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {g.items.map((o) => (
                      <OfferCard key={o.id} offer={o} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function OfferCard({ offer }: { offer: ImporterOfferDto }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5 transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <img
          src={offer.imageUrl}
          alt={offer.name}
          className="h-16 w-16 rounded-xl border object-cover"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.dataset.fallback === "1") return;
            img.dataset.fallback = "1";
            img.src = "/images/default_image.jpg";
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 truncate">
                {offer.name}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="text-sm text-gray-600 font-mono">{offer.code}</div>

                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
                  {offer.categoryName}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Price</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(offer.price)}
              </div>
            </div>
          </div>

          {offer.description ? (
            <div className="mt-2 text-sm text-gray-600 line-clamp-2">
              {offer.description}
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-400">No description</div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Dimensions:{" "}
              <span className="font-medium text-gray-900">
                {offer.width} × {offer.height} × {offer.depth}
              </span>
            </div>

            <div className="text-xs text-gray-500">{formatDate(offer.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function formatPrice(p: string) {
  const n = Number(p);
  if (Number.isNaN(n)) return p;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

