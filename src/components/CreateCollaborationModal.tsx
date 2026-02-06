"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

type AdminUserDto = {
  id: string;
  email: string;
  role: Role;
  companyName: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateCollaborationModal({ open, onClose }: Props) {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [importerId, setImporterId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [submitting, setSubmitting] = useState(false);


  const [status, setStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);

  const importers = useMemo(
    () => users.filter((u) => u.role === "IMPORTER"),
    [users]
  );
  const suppliers = useMemo(
    () => users.filter((u) => u.role === "SUPPLIER"),
    [users]
  );

 
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      try {
        setLoadingUsers(true);
        setLoadError(null);
        setStatus(null);

        const res = await fetch("/api/admin/users", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            (data as any)?.error ||
              `Can't load users. (HTTP ${res.status})`
          );
        }

        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled)
          setLoadError(e?.message ?? "Error loading user");
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }

    setImporterId("");
    setSupplierId("");
    setUsers([]);
    setStatus(null);

    load();

    return () => {
      cancelled = true;
    };
  }, [open]);


  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function userLabel(u: AdminUserDto) {
    const name = u.companyName?.trim();
    return name ? `${name} (${u.email})` : u.email;
  }

  const sameUser = importerId && supplierId && importerId === supplierId;

  const canSubmit =
    !loadingUsers &&
    !submitting &&
    importerId.length > 0 &&
    supplierId.length > 0 &&
    !sameUser;

  async function handleCreate() {
    if (!canSubmit) return;

    try {
        setSubmitting(true);
        setStatus(null);

        const res = await fetch("/api/admin/collaborations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importerId, supplierId }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
        throw new Error(data?.error || `Error (HTTP ${res.status})`);
        }

        setStatus({ type: "success", message: "Successfully created collaboration." });

        setImporterId("");
        setSupplierId("");

    } catch (e: any) {
        const msg = e?.message ?? "Error creating collaboration";
        setStatus({ type: "error", message: msg });
    } finally {
        setSubmitting(false);
    }
  }


  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!submitting) onClose(); 
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-sm"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              Create collaboration
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Choose the importer and supplier, then click Create.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            disabled={submitting}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Importer</label>
            <select
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-400"
              value={importerId}
              onChange={(e) => setImporterId(e.target.value)}
              disabled={loadingUsers || submitting}
            >
              <option value="">
                {loadingUsers ? "Loading..." : "Choose an importer"}
              </option>
              {importers.map((u) => (
                <option key={u.id} value={u.id}>
                  {userLabel(u)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Supplier</label>
            <select
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-400"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={loadingUsers || submitting}
            >
              <option value="">
                {loadingUsers ? "Loading..." : "Choose an supplier"}
              </option>
              {suppliers.map((u) => (
                <option key={u.id} value={u.id}>
                  {userLabel(u)}
                </option>
              ))}
            </select>
          </div>

          {sameUser ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              Importer and supplier cannot be the same user.
            </div>
          ) : null}

          {loadError ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {status ? (
            <div
              className={
                "rounded-xl px-3 py-2 text-sm " +
                (status.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700")
              }
            >
              {status.message}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

