import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/cn";

import { CARD_COLORS, updateColor, useColor } from "./store";

export function ColorPicker(props: { initialColor?: string }) {
  const { initialColor } = props;
  const [open, setOpen] = useState(false);
  const liveColor = useColor();

  useEffect(() => {
    if (!initialColor) return;
    updateColor(initialColor);
    return () => updateColor("");
  }, [initialColor]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="size-6 ml-auto rounded-full shrink-0 cursor-pointer active:scale-[0.96] transition-transform duration-150 ease-active hover:border-border-strong focus-ring"
          style={{ backgroundColor: liveColor }}
          aria-label="Pick a card color"
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="color-picker-popover z-50 rounded-xl shadow-2xl shadow-black/60 border border-border bg-surface p-3 origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out"
        >
          <div className="grid grid-cols-4 gap-2">
            {CARD_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  updateColor(c.value);
                  setOpen(false);
                }}
                className={cn(
                  "size-8 rounded-full cursor-pointer transition-transform duration-150 ease-active hover:scale-110"
                )}
                style={{ backgroundColor: c.value }}
                aria-label={c.name}
                title={c.name}
              />
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
