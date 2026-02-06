"use client";

type DashboardActionCardProps = {
  title: string;
  desc: string;
  onClick: () => void;
};

export default function DashboardActionCard({
  title,
  desc,
  onClick,
}: DashboardActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white p-5 shadow-sm transition
                 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
    </button>
  );
}
