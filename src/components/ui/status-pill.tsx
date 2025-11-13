import { PILL_STYLES } from "@/lib/constants";

interface StatusPillProps {
  label: string;
  online: boolean;
}

export function StatusPill({ label, online }: StatusPillProps) {
  return (
    <span className={PILL_STYLES.status}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          online ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <span
        className={`leading-none ${
          online ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
