"use client";

import { useEffect, useState } from "react";

export type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

export type AdminUser = {
  id: string;
  email: string;
  role: Role;
  companyName: string | null;
  country: string | null;
  address: string | null;
};

export type UpdateUserPayload = {
  email: string;
  companyName: string;
  country: string;
  address: string;
};

const COUNTRY_OPTIONS = [
  "Serbia",
  "Bosnia",
  "Montenegro",
  "Croatia",
  "Hungary",
  "Romania",
  "Bulgaria",
  "North Macedonia",
] as const;


type Props = {
  user: AdminUser;
  onClose: () => void;
  onSave: (data: UpdateUserPayload) => Promise<void> | void;
};

export default function UpdateUserModal({ user, onClose, onSave }: Props) {
  const [form, setForm] = useState<UpdateUserPayload>({
    email: user.email,
    companyName: user.companyName ?? "",
    country: user.country ?? "",
    address: user.address ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      email: user.email,
      companyName: user.companyName ?? "",
      country: user.country ?? "",
      address: user.address ?? "",
    });
    setError(null);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload: UpdateUserPayload = {
        email: form.email.trim(),
        companyName: form.companyName.trim(),
        country: form.country.trim(),
        address: form.address.trim(),
      };

      if (!payload.email) {
        setError("Email je obavezan.");
        return;
      }

      await onSave(payload);
    } catch (err: any) {
      setError(err?.message ?? "Neuspesno snimanje.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Update user</h2>
            <p className="mt-1 text-sm text-gray-600">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-black px-3 py-1.5 text-sm text-black hover:bg-black hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-black bg-white px-3 py-2 text-sm text-black">
            {error}
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-black">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Company name</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Country</label>
            <select
              value={form.country || COUNTRY_OPTIONS[0]}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-black focus:outline-none"
              disabled={saving}
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-black">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              disabled={saving}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-black px-4 py-2 text-sm text-black hover:bg-black hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
