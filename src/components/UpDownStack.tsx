export function UpDownStack({
  up,
  down,
  className,
  align = "start",
}: {
  up: string;
  down: string;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const alignClass = {
    start: "text-left",
    center: "text-center",
    end: "text-right",
  }[align];

  return (
    <div
      className={`flex min-w-0 w-full items-baseline gap-2 truncate ${alignClass} ${className || ""}`}
    >
      <label className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {up}:
      </label>
      <label className="min-w-0 truncate text-sm font-medium text-foreground">{down}</label>
    </div>
  );
}
