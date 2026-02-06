"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "block rounded-xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role;

  const links =
    role === "ADMIN"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/collaborations", label: "Collaborations" },
        ]
      : role === "IMPORTER"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/importer/offers", label: "Offers" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/supplier/offers", label: "My offers" },
        ];

  const company = user.companyName?.trim() || null;

  return (
    <aside className="w-full md:w-72 md:min-h-screen border-b md:border-b-0 md:border-r bg-white">

      <div className="flex h-full flex-col">
        
        <div className="p-5">
          <div className="text-xl font-semibold text-gray-900">
            Importers App
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            
            <div className="text-base font-semibold text-gray-900">
              {company ?? user.email}
            </div>


            {company ? (
              <div className="mt-1 text-sm text-gray-700">{user.email}</div>
            ) : null}

          
            <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
              {role}
            </div>
          </div>
        </div>

        
        <nav className="px-3">
          <div className="space-y-1">
            {links.map((l) => (
              <NavItem key={l.href} href={l.href} label={l.label} />
            ))}
          </div>
        </nav>

        <nav className="px-3 mt-3">
          <button
            onClick={async () => {
              await logout();
              window.location.href = "/login";
            }}
            className="
              block w-full
              rounded-xl
              px-3 py-2
              text-left
              text-sm font-medium
              text-gray-700
              hover:bg-gray-50
              transition
            "
          >
            Logout
          </button>
        </nav>

      </div>
    </aside>
  );
}

