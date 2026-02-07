"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import UpdateUserModal, { UpdateUserPayload, AdminUser } from "@/components/UpdateUserModal";

type Filter = "ALL" | "IMPORTER" | "SUPPLIER";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        
        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        const meData = await meRes.json().catch(() => ({}));

        if (!meRes.ok || meData?.user?.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

       
        const res = await fetch("/api/admin/users", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => []);
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch {
        router.replace("/dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredUsers = useMemo(() => {
    return filter === "ALL" ? users : users.filter((u) => u.role === filter);
  }, [users, filter]);

  async function saveUser(userId: string, data: UpdateUserPayload) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        companyName: data.companyName || null,
        country: data.country || null,
        address: data.address || null,
      }),
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(payload?.error ?? "Update nije uspeo");
    }

    
    setUsers((prev) => prev.map((u) => (u.id === userId ? payload : u)));
    setEditingUser(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700">Loading users...</div>
      </main>
    );
  }

  const selectedUser = editingUser;

  return (
    <>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Admin • Users</h1>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-black focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="IMPORTER">Importers</option>
              <option value="SUPPLIER">Suppliers</option>
            </select>
          </div>

          <table className="mt-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-black">
                <th className="py-3 px-3">Email</th>
                <th className="px-3">Role</th>
                <th className="px-3">Company</th>
                <th className="px-3">Country</th>
                <th className="px-3">Address</th>
                <th className="px-3 text-right"></th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-900">{u.email}</td>

                  <td className="px-3 text-gray-700">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold">
                      {u.role}
                    </span>
                  </td>

                  <td className="px-3 text-gray-800">{u.companyName ?? "—"}</td>
                  <td className="px-3 text-gray-700">{u.country ?? "—"}</td>
                  <td className="px-3 text-gray-700">{u.address ?? "—"}</td>

                  <td className="px-3 text-right">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Nema korisnika za izabrani filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black border border-black hover:bg-black hover:text-white"
          >
            Back to Dashboard
          </a>
        </div>
      </main>

      {selectedUser && (
        <UpdateUserModal
          user={selectedUser}
          onClose={() => setEditingUser(null)}
          onSave={saveUser.bind(null, selectedUser.id)}
        />
      )}
    </>
  );
}
