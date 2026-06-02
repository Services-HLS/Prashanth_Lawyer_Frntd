import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { resetPasswordWithToken } from "@/admin/api";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  validateSearch: (search) => searchSchema.parse(search),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token: tokenFromUrl } = Route.useSearch();
  const [token, setToken] = useState(tokenFromUrl ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithToken(token.trim(), password);
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="admin-card w-full max-w-md">
        <p className="admin-label mb-3">Admin</p>
        <h1 className="admin-display mb-2 text-2xl font-bold">Set new password</h1>

        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-[#0A0F1E]">Your password was updated. You can sign in now.</p>
            <Link to="/admin/login" className="admin-btn-coral inline-block w-full text-center no-underline">
              Sign in →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {!tokenFromUrl && (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
                  Reset token
                </label>
                <input
                  className="admin-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
                New password
              </label>
              <input
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
                Confirm password
              </label>
              <input
                type="password"
                className="admin-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="admin-btn-coral w-full" disabled={loading}>
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/admin/login" className="text-[#E8522A] hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
