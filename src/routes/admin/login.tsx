import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { checkHealth, clearAdminToken, adminFetch } from "@/admin/api";
import { login, ensureSession } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      clearAdminToken();
      await checkHealth();
      await login(email.trim(), password);
      ensureSession(email.trim());
      await adminFetch("/auth/verify");
      window.location.assign("/admin/");
    } catch (err) {
      clearAdminToken();
      setError((err as Error).message || "Invalid credentials or API offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="admin-card w-full max-w-md">
        <p className="admin-label mb-3">Admin</p>
        <h1 className="admin-display mb-2 text-2xl font-bold">Sign in</h1>
        <p className="mb-6 text-sm text-[#6B7385]">
          Use your admin account from the database. First-time setup: run{" "}
          <code className="text-xs">npm run seed:admin</code> in the backend folder.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
              Email
            </label>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.local"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="admin-input pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-xs font-semibold text-[#6B7385] hover:text-[#E8522A] cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="admin-btn-coral w-full" disabled={loading}>
            {loading ? "Signing in…" : "Enter CMS →"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/admin/forgot-password" className="text-[#E8522A] hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-[#6B7385]">
          <a href="/" className="text-[#E8522A] hover:underline">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}
