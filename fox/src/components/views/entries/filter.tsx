import * as Select from "@radix-ui/react-select";
import { getRouteApi } from "@tanstack/react-router";
import { ChevronDown, Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { CURRENT_YEAR, CURRENT_MONTH, MONTH_SHORT, YEARS } from "@/lib/constant";

function AppSelect({
  value,
  onValueChange,
  children,
  ariaLabel
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md",
          "bg-surface-card border border-border",
          "text-xs text-ink-muted hover:text-ink",
          "hover:bg-surface-hover cursor-pointer select-none",
          "transition-all duration-150 ease-out active:scale-[0.97]",
          "focus:outline-none focus:ring-1 focus:ring-accent/30"
        )}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={11} className="text-ink-faint" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className={cn(
            "bg-surface-elevated border border-border rounded-lg overflow-hidden z-50",
            "shadow-xl shadow-black/50",
            "data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
            "origin-(--radix-select-content-transform-origin)"
          )}
          position="popper"
          sideOffset={6}
          align="end"
        >
          <Select.Viewport className="p-1 max-h-56 overflow-y-auto">
            {children}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function AppSelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Select.Item
      value={value}
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-1.5 rounded-md",
        "text-xs text-ink-secondary cursor-pointer outline-none",
        "data-[highlighted]:bg-surface-hover data-[highlighted]:text-ink",
        "data-[state=checked]:text-accent data-[state=checked]:font-medium"
      )}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator>
        <Check size={11} className="text-accent" />
      </Select.ItemIndicator>
    </Select.Item>
  );
}

export function EntryFilter() {
  const routeApi = getRouteApi("/");
  const { year, month } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const maxMonth = year === CURRENT_YEAR ? CURRENT_MONTH : 11;
  const availableMonths = MONTH_SHORT.slice(0, maxMonth + 1);

  function onYearChange(val: string) {
    const nextYear = Number(val);
    const newMaxMonth = nextYear === CURRENT_YEAR ? CURRENT_MONTH : 11;
    navigate({ search: (prev) => ({ year: nextYear, month: Math.min(prev.month, newMaxMonth) }) });
  }

  function onMonthChange(val: string) {
    navigate({ search: (prev) => ({ ...prev, month: Number(val) }) });
  }

  return (
    <div className="flex items-center gap-2">
      <AppSelect value={String(year)} onValueChange={onYearChange} ariaLabel="Select year">
        {[...YEARS].reverse().map((y) => (
          <AppSelectItem key={y} value={String(y)}>
            {y}
          </AppSelectItem>
        ))}
      </AppSelect>

      <AppSelect value={String(month)} onValueChange={onMonthChange} ariaLabel="Select month">
        {availableMonths.map((name, i) => (
          <AppSelectItem key={i} value={String(i)}>
            {name}
          </AppSelectItem>
        ))}
      </AppSelect>
    </div>
  );
}
