"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CollaborationRow = {
  id: string;
  importerId: string;
  supplierId: string;
  createdAt: string | Date;

  importerEmail: string;
  importerCompanyName: string | null;

  supplierEmail: string;
  supplierCompanyName: string | null;
};

function label(email: string, companyName: string | null) {
  const name = companyName?.trim();
  return name ? `${name} (${email})` : email;
}

export default function AdminCollaborationsPage() {
  const [rows, setRows] = useState<CollaborationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/collaborations", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || `Neuspešno (HTTP ${res.status})`);
        }

        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Greška pri učitavanju.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this collaboration?"
    );

    if (!confirmed) return;

    const prev = rows;

    setDeletingId(id);
    setRows((cur) => cur.filter((r) => r.id !== id));

    try {
      const res = await fetch(`/api/admin/collaborations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete");
      }
    } catch (err: any) {
      setRows(prev);
      alert(err?.message || "Error deleting");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Collaborations
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              List of all importer-supplier cooperation.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="
              rounded-xl
              border border-black
              px-4 py-2
              text-sm font-medium
              text-black
              transition
              hover:bg-black hover:text-white
            "
          >
            Back to dashboard
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          {loading ? (
            <div className="text-sm text-gray-700">Loading...</div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-600">Nema saradnji.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm font-semibold text-gray-800">
                    <th className="px-3 py-2">Importer</th>
                    <th className="px-3 py-2">Supplier</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => {
                    const created =
                      typeof r.createdAt === "string"
                        ? new Date(r.createdAt)
                        : r.createdAt;

                    return (
                      <tr key={r.id} className="bg-gray-50">
                        <td className="rounded-l-xl px-3 py-3 text-sm text-gray-900">
                          {label(r.importerEmail, r.importerCompanyName)}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          {label(r.supplierEmail, r.supplierCompanyName)}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700">
                          {isNaN(created.getTime())
                            ? "—"
                            : created.toLocaleString()}
                        </td>
                        <td className="rounded-r-xl px-3 py-3 text-right">
                          <button
                            disabled={deletingId === r.id}
                            onClick={() => handleDelete(r.id)}
                            className="
                              rounded-xl
                              border border-red-600
                              px-3 py-1.5
                              text-xs font-medium
                              text-red-600
                              transition
                              hover:bg-red-600 hover:text-white
                              disabled:opacity-40
                            "
                          >
                            {deletingId === r.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}