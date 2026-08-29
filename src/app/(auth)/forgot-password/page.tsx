import Link from "next/link";
import { requestPasswordReset } from "../actions";

export default function ForgotPasswordPage() {
  return (
    <form action={requestPasswordReset} className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">
        Enter the email you signed up with and we&apos;ll send you a link to reset your
        password.
      </p>

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

      <button type="submit" className="btn btn-primary w-full mt-2">
        Send reset link
      </button>

      <p className="text-center text-sm text-ink-soft">
        <Link href="/login" className="text-green-700 font-semibold">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
