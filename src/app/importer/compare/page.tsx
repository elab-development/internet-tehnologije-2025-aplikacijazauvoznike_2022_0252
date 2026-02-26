"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

const SUPPORTED_CURRENCIES = ["EUR", "RSD", "BAM", "MKD", "HUF", "BGN", "RON"];

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [offers, setOffers] = useState<ImporterOfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rates, setRates] = useState<Record<string, number>>({});
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");

  const idsParam = searchParams.get("ids");

  useEffect(() => {
    async function load() {
      if (!idsParam) {
        setError("No products selected for comparison.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/importer/offers/compare?ids=${idsParam}`,
          { credentials: "include", cache: "no-store" }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to load comparison.");
        }

        setOffers(data ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Error loading comparison.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [idsParam]);

  useEffect(() => {
    async function loadRates() {
      try {
        const res = await fetch("/api/exchange", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        setRates(data.rates || {});
      } catch {
        console.error("Exchange rate fetch failed");
      }
    }

    loadRates();
  }, []);

  function convert(price: number) {
    if (selectedCurrency === "EUR") return price;
    const rate = rates[selectedCurrency];
    if (!rate) return price;
    return price * rate;
  }

  const minValues = useMemo(() => {
    if (offers.length === 0) return null;

    return {
      price: Math.min(...offers.map(o => convert(Number(o.price)))),
      width: Math.min(...offers.map(o => o.width)),
      height: Math.min(...offers.map(o => o.height)),
      depth: Math.min(...offers.map(o => o.depth)),
    };
  }, [offers, selectedCurrency, rates]);

  function highlight(value: number, min?: number) {
    if (min === undefined) return "";
    return value === min ? "text-green-600 font-bold" : "";
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: selectedCurrency,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="text-gray-700">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="text-red-600">{error}</div>
      </main>
    );
  }

  if (!offers.length || !minValues) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div>No offers to compare.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Product Comparison
          </h1>

          <div className="flex items-center gap-4">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-white"
            >
              {SUPPORTED_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => router.push("/importer/offers")}
              className="rounded-xl border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition"
            >
              Back to offers
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border border-gray-300 overflow-x-auto">
          <table className="min-w-full border-collapse text-gray-900">
            <thead>
              <tr>
                <th className="border border-gray-400 p-4 bg-gray-200 text-left font-semibold w-56">
                  Feature
                </th>
                {offers.map((o) => (
                  <th
                    key={o.id}
                    className="border border-gray-400 p-4 bg-gray-200 text-left font-semibold min-w-[250px]"
                  >
                    {o.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>

              <Row label="Image">
                {offers.map((o) => (
                  <td key={o.id} className="border border-gray-400 p-4">
                    <img
                      src={o.imageUrl}
                      alt={o.name}
                      className="h-24 object-contain"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.dataset.fallback === "1") return;
                        img.dataset.fallback = "1";
                        img.src = "/images/default_image.jpg";
                      }}
                    />
                  </td>
                ))}
              </Row>

              <Row label="Code">
                {offers.map((o) => (
                  <td key={o.id} className="border border-gray-400 p-4 font-mono">
                    {o.code}
                  </td>
                ))}
              </Row>

              <Row label="Category">
                {offers.map((o) => (
                  <td key={o.id} className="border border-gray-400 p-4">
                    {o.categoryName}
                  </td>
                ))}
              </Row>

              <Row label="Price">
                {offers.map((o) => {
                  const converted = convert(Number(o.price));
                  return (
                    <td
                      key={o.id}
                      className={`border border-gray-400 p-4 ${highlight(converted, minValues.price)}`}
                    >
                      {formatCurrency(converted)}
                    </td>
                  );
                })}
              </Row>

              <Row label="Width">
                {offers.map((o) => (
                  <td key={o.id} className={`border border-gray-400 p-4 ${highlight(o.width, minValues.width)}`}>
                    {o.width}
                  </td>
                ))}
              </Row>

              <Row label="Height">
                {offers.map((o) => (
                  <td key={o.id} className={`border border-gray-400 p-4 ${highlight(o.height, minValues.height)}`}>
                    {o.height}
                  </td>
                ))}
              </Row>

              <Row label="Depth">
                {offers.map((o) => (
                  <td key={o.id} className={`border border-gray-400 p-4 ${highlight(o.depth, minValues.depth)}`}>
                    {o.depth}
                  </td>
                ))}
              </Row>

              <Row label="Description">
                {offers.map((o) => (
                  <td key={o.id} className="border border-gray-400 p-4 text-sm">
                    {o.description ?? "No description"}
                  </td>
                ))}
              </Row>

              <Row label="Created At">
                {offers.map((o) => (
                  <td key={o.id} className="border border-gray-400 p-4 text-sm">
                    {formatDate(o.createdAt)}
                  </td>
                ))}
              </Row>

            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="border border-gray-400 p-4 font-semibold bg-gray-100">
        {label}
      </td>
      {children}
    </tr>
  );
}

function formatDate(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}