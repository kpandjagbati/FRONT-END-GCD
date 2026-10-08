export function SearchAlert({
  message,
  tone = "error",
}: {
  message: string | null;
  tone?: "error" | "info" | "success";
}) {
  if (!message) return null;
  const style =
    tone === "success"
      ? "bg-[#e8f6ee] text-[#1f7a46]"
      : tone === "info"
        ? "bg-[#eef4ff] text-yas-navy"
        : "bg-[#fff1f1] text-[#c24545]";
  return (
    <p className={`mt-4 rounded-xl px-3 py-2 text-center text-xs font-semibold ${style}`}>{message}</p>
  );
}

export function EmptyResults({ message }: { message: string }) {
  return (
    <p className="rounded-2xl bg-[#f7f9fc] px-4 py-8 text-center text-sm font-medium text-neutral-500">
      {message}
    </p>
  );
}
