"use client";

import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function NewCategoryModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim()) return;

    try {
      setSaving(true);

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to create category");
        return;
      }

      onClose();
      onSuccess?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-lg font-semibold text-black mb-4">
          New Category
        </h2>

        <label className="block text-sm text-black mb-1">
          Category name
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-black px-3 py-2 text-sm text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 mb-4"
          placeholder="e.g. Monitors"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-85 disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}