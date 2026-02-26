"use client";

import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function NewContainerModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [label, setLabel] = useState("");
  const [maxWidth, setMaxWidth] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [maxDepth, setMaxDepth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLabel("");
      setMaxWidth("");
      setMaxHeight("");
      setMaxDepth("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const width = Number(maxWidth);
    const height = Number(maxHeight);
    const depth = Number(maxDepth);

    if (!width || !height || !depth) {
      setError("All dimensions are required.");
      return;
    }

    if (width < 2 || width > 2.5) {
      setError("Width must be between 2.00 and 2.50 meters.");
      return;
    }

    if (height < 2 || height > 2.5) {
      setError("Height must be between 2.00 and 2.50 meters.");
      return;
    }

    if (depth < 5 || depth > 9) {
      setError("Depth must be between 5.00 and 9.00 meters.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/importer/containers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          label: label || null,
          maxWidth: width,
          maxHeight: height,
          maxDepth: depth,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to create container");
      }

      onSuccess?.();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-96 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-black mb-4">
          New Container
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-black mb-1">
              Label (optional)
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Custom Container"
              className="w-full rounded-xl border border-black px-3 py-2 text-sm text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">
              Max Width (meters)
            </label>
            <input
              type="number"
              step="0.01"
              min="2"
              max="2.5"
              placeholder="2.35"
              value={maxWidth}
              onChange={(e) => setMaxWidth(e.target.value)}
              className="w-full rounded-xl border border-black px-3 py-2 text-sm text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">
              Max Height (meters)
            </label>
            <input
              type="number"
              step="0.01"
              min="2"
              max="2.5"
              placeholder="2.39"
              value={maxHeight}
              onChange={(e) => setMaxHeight(e.target.value)}
              className="w-full rounded-xl border border-black px-3 py-2 text-sm text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">
              Max Depth (meters)
            </label>
            <input
              type="number"
              step="0.01"
              min="5"
              max="9"
              placeholder="6.00"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
              className="w-full rounded-xl border border-black px-3 py-2 text-sm text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}