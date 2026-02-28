"use client";

import { useState, useEffect } from "react";

type ImporterOfferDto = {
  id: string;
  name: string;
};

type ContainerDto = {
  id: string;
  label: string;
};

type Props = {
  offer: ImporterOfferDto | null;
  containers: ContainerDto[];
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AddToContainerModal({
  offer,
  containers,
  onClose,
  onSuccess,
}: Props) {
  const [selectedContainerId, setSelectedContainerId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (offer) {
      setSelectedContainerId("");
      setQuantity(1);
      setAdding(false);
    }
  }, [offer]);

  if (!offer) return null;

  async function handleAdd() {
    if (!offer) return; 

    if (!selectedContainerId || quantity < 1) return;

    try {
      setAdding(true);

      const res = await fetch("/api/containerItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          containerId: selectedContainerId,
          offerId: offer.id, 
          quantity,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ?? "Cannot add item");
        return;
      }

      alert("Added successfully");
      onClose();
      onSuccess?.();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-lg font-semibold text-black mb-4">
          Add: {offer.name}
        </h2>

        <label className="block text-sm text-black mb-1">Container</label>
        <select
          value={selectedContainerId}
          onChange={(e) => setSelectedContainerId(e.target.value)}
          className="
            w-full
            rounded-xl border border-black
            px-3 py-2 text-sm
            text-gray-900
            outline-none
            focus:ring-2 focus:ring-black/20
            mb-3
          "
        >
          <option value="">Select container</option>
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="block text-sm text-black mb-1">Quantity</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="
            w-full
            rounded-xl border border-black
            px-3 py-2 text-sm
            text-gray-900
            outline-none
            focus:ring-2 focus:ring-black/20
            mb-4
          "
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="
              min-w-[90px]
              rounded-xl
              border border-black
              px-4 py-2
              text-sm font-medium
              text-black
              transition
              hover:bg-black hover:text-white
            "
          >
            Cancel
          </button>

          <button
            disabled={!selectedContainerId || quantity < 1 || adding}
            onClick={handleAdd}
            className="
              min-w-[90px]
              rounded-xl
              bg-black
              px-4 py-2
              text-sm font-medium
              text-white
              transition
              hover:opacity-85
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}