"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ContainerData = {
  container: {
    id: string;
    label: string | null;
    status: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: string;
  }[];
  percentage: number;
  usedVolume: number;
  maxVolume: number;
};

export default function ContainerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [data, setData] = useState<ContainerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/importer/containers/${id}`, {
        credentials: "include",
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to load container");
      }

      setData(result);
    } catch (err: any) {
      setError(err?.message || "Error loading container");
    } finally {
      setLoading(false);
    }
  }

  async function finalize() {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to finalize this container?\n\nYou will not be able to add more items."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/importer/containers/${id}/finalize`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result?.error || "Failed to finalize container.");
        return;
      }

      alert("Container successfully finalized.");
      load();
    } catch {
      alert("Something went wrong.");
    }
  }

  async function removeItem(itemId: string) {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this item from container?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/importer/containers/${id}/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result?.error || "Failed to remove item.");
        return;
      }

      load();
    } catch {
      alert("Something went wrong.");
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  const totalContainerValue = useMemo(() => {
    if (!data) return 0;

    return data.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);
  }, [data]);

  const totalUnits = useMemo(() => {
    if (!data) return 0;

    return data.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
  }, [data]);

  const distinctProducts = useMemo(() => {
    if (!data) return 0;
    return data.items.length;
  }, [data]);

  if (loading) {
    return <div className="p-6 text-black">Loading...</div>;
  }

  if (error || !data?.container) {
    return (
      <div className="p-6 text-red-600">
        {error || "Container not found."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-semibold text-black">
              {data.container.label || "Container"}
            </h1>

            <button
              onClick={() => router.push("/importer/containers")}
              className="rounded-xl border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              Back
            </button>
          </div>

          <div className="mt-4">
            <div
              className={`text-sm mb-2 ${
                data.percentage > 90
                  ? "text-red-600"
                  : data.percentage > 50
                  ? "text-green-600"
                  : "text-black"
              }`}
            >
              Filled: {data.percentage.toFixed(2)}% (
              {data.usedVolume.toFixed(2)} m³ / {data.maxVolume.toFixed(2)} m³)
            </div>

            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  data.percentage > 90
                    ? "bg-red-600"
                    : data.percentage > 50
                    ? "bg-green-600"
                    : "bg-black"
                }`}
                style={{ width: `${data.percentage}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-2 text-black">
            <div className="text-lg font-semibold">
              Total container value:{" "}
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(totalContainerValue)}
            </div>

            <div className="text-sm">
              Total units:{" "}
              <span className="font-semibold">
                {totalUnits}
              </span>
            </div>

            <div className="text-sm">
              Distinct products:{" "}
              <span className="font-semibold">
                {distinctProducts}
              </span>
            </div>
          </div>

          {data.container.status === "DRAFT" && data.percentage >= 50 && (
            <button
              onClick={finalize}
              className="mt-6 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition duration-200 hover:opacity-85 hover:scale-[1.03] active:scale-95"
            >
              Finalize container
            </button>
          )}
        </div>

        <div className="space-y-4">
          {data.items.length === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-black">
              No items in this container.
            </div>
          )}

          {data.items.map((item) => {
            const totalPrice =
              Number(item.price) * item.quantity;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold text-black">
                      {item.name}
                    </div>

                    <div className="mt-2 text-sm text-black">
                      Quantity:{" "}
                      <span className="font-medium">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-black">
                      Unit price:{" "}
                      <span className="font-medium">
                        {new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: "EUR",
                        }).format(Number(item.price))}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-black font-semibold">
                      Total:{" "}
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "EUR",
                      }).format(totalPrice)}
                    </div>
                  </div>

                  {data.container.status === "DRAFT" && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-xl border border-red-600 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}