export default function SettingsPage() {
  return (
    <main className="min-h-svh bg-slate-50 p-4 text-slate-900 sm:p-8">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-emerald-600">
          School Management
        </p>
        <h1 className="mt-1 text-3xl font-bold">Settings</h1>
        <p className="mt-3 text-sm text-slate-500">
          The settings section is available at this route.
        </p>
        <a
          href="/dashboud"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Dashboard
        </a>
      </section>
    </main>
  )
}
