"use client";

import Link from "next/link";

type DashboardCardProps = {
  title: string;
  desc: string;
  href: string;
};

export default function DashboardCard({
  title,
  desc,
  href,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl bg-white p-5 shadow-sm transition
                 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
    </Link>
  );
}
