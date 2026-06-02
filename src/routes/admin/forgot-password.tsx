import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { requestPasswordReset } from "@/admin/api";

export const Route = createFileRoute("/admin/forgot-password")({
  ssr: false,
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    message: string;
    resetUrl?: string | null;
    expiresAt?: string;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await requestPasswordReset(email.trim(), newPassword, confirmPassword);
      setResult(data);
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
        <h1 className="admin-display mb-2 text-2xl font-bold">Reset password</h1>
        <p className="mb-6 text-sm text-[#6B7385]">
          Enter your email, new password and confirm password. Password updates immediately.
        </p>

        {!result ? (
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
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
                New password
              </label>
              <input
                type="password"
                className="admin-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
                Confirm new password
              </label>
              <input
                type="password"
                className="admin-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="admin-btn-coral w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#0A0F1E]">{result.message}</p>
            <p className="text-sm text-[#6B7385]">Now sign in with your updated password.</p>
          </div>
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
