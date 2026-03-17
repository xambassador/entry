import { useState } from "react";
import { Hash } from "lucide-react";

export function Tags() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  function handleAddTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <p className="text-[12px] tracking-widest uppercase mb-2 text-ink-faint">Tags</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {hashIcon}
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 rounded-full text-xs tracking-wider uppercase cursor-pointer group flex items-center gap-1 transition-all duration-200 text-ink-faint border border-gilt-dim"
            onClick={() => handleRemoveTag(tag)}
          >
            {tag}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-wax-light">&#x2715;</span>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder="add tag..."
          className="bg-transparent text-xs tracking-wider outline-none w-16 text-ink-muted"
        />
      </div>
    </div>
  );
}

const hashIcon = <Hash size={11} strokeWidth={1.5} className="text-ink-faint" />;
