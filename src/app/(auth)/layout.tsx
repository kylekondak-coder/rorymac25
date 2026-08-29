export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-green-700 mb-1 text-center">
          Papertrail
        </h1>
        <p className="text-center text-sm text-ink-soft mb-8">
          Fire compliance, tracked per building.
        </p>
        <div className="bg-paper-raised border border-border rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
