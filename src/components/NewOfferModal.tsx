"use client";

import { useEffect, useState } from "react";

type CategoryDto = { id: string; name: string };

type FormState = {
  categoryId: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  width: string;
  height: string;
  depth: string;
};

export default function NewOfferModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const [form, setForm] = useState<FormState>({
    categoryId: "",
    code: "",
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    width: "",
    height: "",
    depth: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetch("/api/categories", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => []);
        if (!cancelled && res.ok) setCategories(data);
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setError(null);
    setSubmitting(false);
    setForm({
      categoryId: "",
      code: "",
      name: "",
      description: "",
      imageUrl: "",
      price: "",
      width: "",
      height: "",
      depth: "",
    });
  }

  function validate(): string | null {
    if (!form.categoryId) return "Please select a category.";
    if (!form.code.trim()) return "Enter product code.";
    if (!form.name.trim()) return "Enter product name.";
    if (!form.imageUrl.trim()) return "Enter image URL.";
    if (!form.price.trim() || Number.isNaN(Number(form.price)))
      return "Enter a valid price.";
    if (!form.width.trim() || Number.isNaN(Number(form.width)))
      return "Enter width.";
    if (!form.height.trim() || Number.isNaN(Number(form.height)))
      return "Enter height.";
    if (!form.depth.trim() || Number.isNaN(Number(form.depth)))
      return "Enter depth.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const msg = validate();
    if (msg) return setError(msg);

    setSubmitting(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim(),
        price: form.price,
        width: Number(form.width),
        height: Number(form.height),
        depth: Number(form.depth),
      };

      const res = await fetch("/api/supplier/offers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `POST failed (${res.status})`);

      onCreated?.();
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Error while saving.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      
      <div
        className="absolute inset-0 bg-black/40"
        onMouseDown={onClose}
      />

      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-sm"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                New Offer
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Create a new product offer.
              </p>
            </div>

            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-xl border px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
              disabled={submitting}
            >
              Close
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          
            <div className="md:col-span-2">
              <Label>Category</Label>

              {loadingCats ? (
                <div className="mt-1 text-sm text-gray-600">
                  Loading categories...
                </div>
              ) : categories.length > 0 ? (
                <select
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="">Select...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  placeholder="Category ID (temporary)"
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-black/10"
                />
              )}
            </div>

            <div>
              <Label>Code</Label>
              <input
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. IP15-BLU-128"
              />
            </div>

            <div>
              <Label>Name</Label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. iPhone 15 128GB Blue"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description (optional)</Label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Image URL</Label>
              <input
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. /images/default-product.jpg or https://..."
              />

              <div className="mt-2 flex items-center gap-3">
                {form.imageUrl.trim() ? (
                  <img
                    src={form.imageUrl.trim()}
                    alt="preview"
                    className="h-12 w-12 rounded-xl border object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.dataset.fallback === "1") return;
                      img.dataset.fallback = "1";
                      img.src = "/images/default-product.jpg";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl border bg-gray-50" />
                )}
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            </div>

            <div>
              <Label>Price</Label>
              <input
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. 129999.99"
              />
            </div>

            <div>
              <Label>Width</Label>
              <input
                value={form.width}
                onChange={(e) => set("width", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. 7.1"
              />
            </div>

            <div>
              <Label>Height</Label>
              <input
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. 14.7"
              />
            </div>

            <div>
              <Label>Depth</Label>
              <input
                value={form.depth}
                onChange={(e) => set("depth", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. 0.8"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="rounded-xl border px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-gray-900">{children}</div>;
}
