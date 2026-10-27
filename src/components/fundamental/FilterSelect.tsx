import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
};

/** Native select styled like the app's Input — native keeps mobile pickers and keyboard behaviour for free. */
export function FilterSelect({ id, label, value, options, onChange, className }: FilterSelectProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-surface-border bg-surface-card pl-3 pr-9 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      </div>
    </div>
  );
}
