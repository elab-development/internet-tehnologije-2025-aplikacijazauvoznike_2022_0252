"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("IMPORTER");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (username.length < 3) {
      setError("Username mora imati najmanje 3 karaktera.");
      return;
    }

    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lozinke se ne poklapaju.");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({ username, email, role })
    );

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">
          Register
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Kreiraj nalog za pristup aplikaciji.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="perapera"
            />
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lozinka
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Potvrdi lozinku
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Uloga
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
            >
              <option value="IMPORTER">Importer</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-600">
            Već imaš nalog?{" "}
            <a href="/login" className="underline text-black">
              Login
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}