import { Reveal } from "./motion";

/** Two-column layout for login and registration: navy message panel beside the form. */
export function AuthShell({
  eyebrow,
  title,
  body,
  points,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="container pt-8 md:pt-14">
      <div className="grid overflow-hidden rounded-[2rem] border border-cream-200 bg-white shadow-lift lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-navy-800 p-8 text-cream sm:p-12">
          <Reveal>
            <p className="eyebrow text-amber-400">{eyebrow}</p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-cream sm:text-4xl">{title}</h1>
            <p className="mt-4 text-navy-200">{body}</p>
            <ol className="mt-10 space-y-5">
              {points.map((p, i) => (
                <li key={p} className="flex gap-4 border-t border-white/10 pt-5">
                  <span className="text-sm font-bold tabular-nums text-amber-400">0{i + 1}</span>
                  <span className="text-sm text-navy-100">{p}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        <div className="p-8 sm:p-12">{children}</div>
      </div>
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong className="font-semibold">Demo mode.</strong> Firebase isn&apos;t connected yet, so accounts can&apos;t be
      created or used. Add your Firebase keys to <code className="font-mono text-xs">.env.local</code> to turn on
      login.
    </div>
  );
}
