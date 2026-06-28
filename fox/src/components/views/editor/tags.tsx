import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { updateTags } from "./store";

export function Tags(props: { tags?: string[]; isAuthenticated?: boolean }) {
  const { tags: initialTags, isAuthenticated } = props;
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = initialTags || [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTags(t);
    updateTags(t);
  }, [initialTags]);

  function handleAddTag() {
    const tagInput = ref.current?.value || "";
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      const next = [...tags, tagInput.trim().toLowerCase()];
      setTags(next);
      updateTags(next);
      if (ref.current) {
        ref.current.value = "";
      }
    }
  }

  function handleRemoveTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    updateTags(next);
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs text-ink-muted border border-border bg-surface-card flex items-center gap-1 transition-colors duration-150",
            isAuthenticated && "cursor-pointer hover:border-danger/40 hover:text-danger"
          )}
          onClick={() => (isAuthenticated ? handleRemoveTag(tag) : undefined)}
        >
          #{tag}
        </span>
      ))}

      {isAuthenticated && (
        <input
          ref={ref}
          type="text"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }

            if (e.key === "Backspace" && !ref.current?.value && tags.length) {
              e.preventDefault();
              handleRemoveTag(tags[tags.length - 1]);
            }
          }}
          placeholder="add tag..."
          className="bg-transparent text-xs text-ink-muted placeholder:text-ink-faint/50 outline-none w-16 caret-accent"
        />
      )}
    </div>
  );
}
