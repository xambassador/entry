import { useEffect, useRef, useState } from "react";
import { Hash } from "lucide-react";

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
    <div>
      <p className="text-[12px] tracking-widest uppercase mb-2 text-ink-faint">Tags</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {hashIcon}
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "px-2 rounded-full text-xs tracking-wider uppercase group flex items-center gap-1 transition-all duration-200 text-ink-faint border border-gilt-dim",
              isAuthenticated && "cursor-pointer"
            )}
            onClick={() => (isAuthenticated ? handleRemoveTag(tag) : undefined)}
          >
            {tag}
            {isAuthenticated && xIcon}
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
            className="bg-transparent text-xs tracking-wider outline-none w-16 text-ink-muted"
          />
        )}
      </div>
    </div>
  );
}

const hashIcon = <Hash size={11} strokeWidth={1.5} className="text-ink-faint" />;
const xIcon = <span className="opacity-0 group-hover:opacity-100 transition-opacity text-wax-light">&#x2715;</span>;
