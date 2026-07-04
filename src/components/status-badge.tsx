import { Badge } from "@/components/ui/badge";

const styles = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  APPROVED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  REJECTED: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
} as const;

export function StatusBadge({ status }: { status: keyof typeof styles }) {
  return (
    <Badge variant="secondary" className={styles[status]}>
      {status.toLowerCase()}
    </Badge>
  );
}
