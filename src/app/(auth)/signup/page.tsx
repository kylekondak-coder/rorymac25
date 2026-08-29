import Link from "next/link";
import { signup } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form action={signup} className="flex flex-col gap-4">
      {error && <div className="error-banner">{error}</div>}

      <div>
        <label className="field-label" htmlFor="organisation_name">
          Company name
        </label>
        <input
          className="field-input"
          id="organisation_name"
          name="organisation_name"
          type="text"
          placeholder="Triple A Fire & Security"
          required
        />
      </div>

      <div>
        <label className="field-label" htmlFor="full_name">
          Your name
        </label>
        <input
          className="field-input"
          id="full_name"
          name="full_name"
          type="text"
          required
        />
      </div>

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
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          className="field-input"
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full mt-2">
        Create account
      </button>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="text-green-700 font-semibold">
          Log in
        </Link>
      </p>
    </form>
  );
}
