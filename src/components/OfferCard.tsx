"use client";

export type SupplierOfferDto = {
  id: string;
  categoryId: string;
  categoryName: string;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string;
  price: string;
  width: number;
  height: number;
  depth: number;
  createdAt: string;
};

type OfferCardProps = {
  offer: SupplierOfferDto;
  deleting?: boolean;
  onDelete?: () => void;

  showDelete?: boolean;
};

export default function OfferCard({
  offer,
  deleting = false,
  onDelete,
  showDelete = true,
}: OfferCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <img
          src={offer.imageUrl}
          alt={offer.name}
          className="h-16 w-16 rounded-xl border object-cover"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.dataset.fallback === "1") return;
            img.dataset.fallback = "1";
            img.src = "/images/default_image.jpg";
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 truncate">
                {offer.name}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="text-sm text-gray-600 font-mono">
                  {offer.code}
                </div>

                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {offer.categoryName}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Price</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(offer.price)}
              </div>
            </div>
          </div>

          {offer.description ? (
            <div className="mt-2 text-sm text-gray-600 line-clamp-2">
              {offer.description}
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-400">No description</div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Dimensions:{" "}
              <span className="font-medium text-gray-900">
                {offer.width} × {offer.height} × {offer.depth}
              </span>
            </div>

            <div className="text-xs text-gray-500">{formatDate(offer.createdAt)}</div>
          </div>

          {showDelete ? (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={onDelete}
                disabled={deleting}
                className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatDate(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function formatPrice(p: string) {
  const n = Number(p);
  if (Number.isNaN(n)) return p;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}
