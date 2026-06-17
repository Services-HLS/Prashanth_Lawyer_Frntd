import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { isAuthenticated, login } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/admin" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      window.location.assign("/admin/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-[rgba(10,15,30,0.1)] bg-white p-8 shadow-sm"
      >
        <h1 className="font-serif text-2xl font-bold text-[#0A0F1E]">Admin login</h1>
        <p className="mt-1 text-sm text-[#6B7385]">
          Sign in with your admin email from the database.
        </p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <label className="mt-6 block text-sm font-medium">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <div className="mt-4">
          <label className="block text-sm font-medium">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-md border px-3 py-2 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
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
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md bg-[#1B4D3E] py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <a href="/admin/forgot-password" className="mt-4 block text-center text-sm text-[#E8522A]">
          Forgot password?
        </a>
        <a href="/" className="mt-2 block text-center text-sm text-[#6B7385]">
          ← Back to site
        </a>
      </form>
    </div>
  );
}
