"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Login failed");
        return;
      }

      router.refresh(); 
      router.push("/dashboard"); 

    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
        <p className="mt-1 text-sm text-gray-600">
          Log in to access the app.
        </p>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="pera@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-2 text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Logging..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600">
            You don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-black underline hover:opacity-80"
            >
              Register
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}