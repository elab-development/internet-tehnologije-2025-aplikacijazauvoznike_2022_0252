export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">
          Login
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Prijavi se da bi pristupio aplikaciji.
        </p>

        <form className="mt-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="perapera"
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="pera@gmail.com"
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lozinka
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-2 text-white transition hover:bg-gray-800"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Nemaš nalog?{" "}
            <a
              href="/register"
              className="font-medium text-black underline hover:opacity-80"
            >
              Registruj se
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}