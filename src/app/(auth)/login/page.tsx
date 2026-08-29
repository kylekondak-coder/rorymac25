import Link from "next/link";
import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <form action={login} className="flex flex-col gap-4">
      {notice && <div className="notice-banner">{notice}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          className="field-input"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-green-700 font-semibold">
            Forgot password?
          </Link>
        </div>
        <input
          className="field-input"
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full mt-2">
        Log in
      </button>

      <p className="text-center text-sm text-ink-soft">
        No account?{" "}
        <Link href="/signup" className="text-green-700 font-semibold">
          Sign up
        </Link>
      </p>
    </form>
  );
}
