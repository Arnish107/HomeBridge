export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-cream-300 px-6 py-16 text-center">
      <p className="font-semibold text-navy-800">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-navy-500">{body}</p>
    </div>
  );
}
