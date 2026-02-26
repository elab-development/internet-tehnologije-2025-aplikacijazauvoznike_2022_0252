import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-sm p-12">
        
        <div className="mb-20">
          <h1 className="text-2xl font-semibold text-gray-900">
            SupplyChain Platform
          </h1>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-4xl font-semibold text-gray-900 leading-tight">
            Connect importers and suppliers
            <br />
            in one centralized system.
          </h2>

          <p className="mt-6 text-gray-600 text-lg">
            Manage product offers, collaborations and containers
            through a structured and role-based platform built
            for modern supply chain management.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="px-6 py-3 rounded-xl border border-gray-400 text-gray-800 hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        
      </div>
    </main>
  );
}