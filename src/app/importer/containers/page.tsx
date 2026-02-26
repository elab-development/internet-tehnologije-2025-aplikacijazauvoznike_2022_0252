"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewContainerModal from "@/components/NewContainerModal";

type ContainerDto = {
  id: string;
  label: string | null;
  maxWidth: number;
  maxHeight: number;
  maxDepth: number;
  status: string;
  createdAt: string;
};

export default function ImporterContainersPage() {
  const router = useRouter();

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "DRAFT" | "FINALIZED">("ALL");

  const [containers, setContainers] = useState<ContainerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNewModal, setShowNewModal] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/importer/containers", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to load containers");
      }

      setContainers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Greška");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredContainers =
    statusFilter === "ALL"
      ? containers
      : containers.filter((c) => c.status === statusFilter);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-black">
            My Containers
          </h1>
          <p className="text-sm text-black mt-1">
            Manage and track your containers.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="
              rounded-xl
              bg-black
              px-4 py-2
              text-sm font-medium
              text-white
              transition
              duration-200
              hover:opacity-85
              hover:scale-[1.03]
              active:scale-95
            "
          >
            + New Container
          </button>

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
      </div>

      <div className="flex gap-3 mb-6">
        {["ALL", "DRAFT", "FINALIZED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
              statusFilter === s
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black hover:bg-black hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          Loading...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-red-600 font-medium">Error</div>
          <div className="text-sm text-red-600 mt-1">{error}</div>
        </div>
      )}

      {!loading && !error && filteredContainers.length === 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm text-black">
          No containers for selected filter.
        </div>
      )}

      {!loading && !error && filteredContainers.length > 0 && (
        <div className="space-y-4">
          {filteredContainers.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-black">
                    {c.label ?? "Unnamed Container"}
                  </div>

                  <div className="text-sm text-black mt-1">
                    Dimensions: {c.maxWidth} × {c.maxHeight} × {c.maxDepth}
                  </div>

                  <div className="text-sm text-black mt-1">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        c.status === "FINALIZED"
                          ? "text-green-600"
                          : "text-black"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="text-xs text-black mt-2">
                    Created: {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(`/importer/containers/${c.id}`)
                  }
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
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewContainerModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={load}
      />
    </main>
  );
}