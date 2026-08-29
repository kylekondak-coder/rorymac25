import { updatePassword } from "../actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form action={updatePassword} className="flex flex-col gap-4">
      {error && <div className="error-banner">{error}</div>}

      <p className="text-sm text-ink-soft">Choose a new password for your account.</p>

      <div>
        <label className="field-label" htmlFor="password">
          New password
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
        Set new password
      </button>
    </form>
  );
}
