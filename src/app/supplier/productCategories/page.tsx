"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewCategoryModal from "@/components/NewCategoryModal";

type CategoryDto = {
  id: string;
  name: string;
};

export default function SupplierCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/categories", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load categories");
      }

      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Error loading categories");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    const prev = categories;
    setDeletingId(id);
    setCategories((cur) => cur.filter((c) => c.id !== id));

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete category");
      }
    } catch (err: any) {
      setCategories(prev);
      alert(err?.message || "Error deleting category");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Product Categories
            </h1>
            <p className="text-sm text-black mt-1">
              Manage available product categories.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-85"
            >
              + New Category
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Back to dashboard
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-black">
            Loading...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-black">
            No categories found.
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="space-y-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between"
              >
                <div className="text-lg font-semibold text-black">
                  {c.name}
                </div>

                <button
                  disabled={deletingId === c.id}
                  onClick={() => handleDelete(c.id)}
                  className="
                    rounded-xl
                    border border-red-600
                    px-4 py-2
                    text-sm font-medium
                    text-red-600
                    transition
                    hover:bg-red-600 hover:text-white
                    disabled:opacity-40
                  "
                >
                  {deletingId === c.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}

        <NewCategoryModal
          open={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSuccess={load}
        />
      </div>
    </main>
  );
}