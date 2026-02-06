"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "IMPORTER" | "SUPPLIER";

const COUNTRY_OPTIONS = [
  "Serbia",
  "Bosnia and Herzegovina",
  "Montenegro",
  "Croatia",
  "Hungary",
  "Romania",
  "Bulgaria",
  "North Macedonia",
] as const;


export default function RegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState<string>(COUNTRY_OPTIONS[0]); 
  const [address, setAddress] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("IMPORTER");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (companyName.trim().length < 3) {
      setError("The company name must have at least 3 characters.");
      return;
    }
    if (country.trim().length < 2) {
      setError("The state is mandatory.");
      return;
    }
    if (address.trim().length < 5) {
      setError("The address must have at least 5 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must have at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
          companyName: companyName.trim(),
          country: country.trim(),
          address: address.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Greška pri registraciji.");
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch {
      setError("Greška u mreži. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">Register</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create account (Importer ili Supplier).
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company name
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="e.g. Importer DOO"
              autoComplete="organization"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              required
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="Street and number, city"
              autoComplete="street-address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
            >
              <option value="IMPORTER">Importer</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="pera@gmail.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-600">
            You already have an account?{" "}
            <a href="/login" className="underline text-black">
              Login
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}