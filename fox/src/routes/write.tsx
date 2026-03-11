import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Hash } from "lucide-react";

import "./write.css";

import type { Mood } from "@/types";

import { MoodPicker } from "@/components/mood-picker";

export const Route = createFileRoute("/write")({ component: RouteComponent });

const quote = {
  text: "One day I will find the right words, and they will be simple.",
  author: "Jack Kerouac"
};

function RouteComponent() {
  const [mood, setMood] = useState<Mood>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  function handleAddTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  const handleMoodChange = useCallback((mood: Mood) => {
    setMood(mood);
    setShowMoodPicker(false);
  }, []);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.max(ta.scrollHeight, 480) + "px";
  }, []);

  useEffect(() => {
    autoResize();
  }, [content, autoResize]);

  return (
    <div className="flex flex-col flex-1 gap-5 h-full">
      {backToEntries}

      <div className="open-diary overflow-hidden w-full flex-1 min-h-0 flex flex-col relative bg-transparent rounded-3xl">
        {diaryEdgeTop}
        {diaryEdgeBottom}

        <div className="flex flex-1 min-h-0">
          <div className="open-diary-left open-diary-paper-texture relative w-1/2 flex flex-col justify-between p-8 max-[900px]:w-full max-[900px]:p-6 bg-journal-surface z-2 shrink-0 rounded-l-3xl">
            <div className="relative z-3 space-y-6">
              <div>
                <p className="text-6xl font-light leading-none text-ink opacity-80">10</p>
                <p className="text-sm mt-2 tracking-wide text-ink-secondary">Tuesday</p>
                <p className="text-sm mt-0.5 text-ink-secondary opacity-60">March, 2026</p>
              </div>

              {ornament}

              <div>
                <blockquote className="leading-relaxed text-ink-secondary">&ldquo;{quote.text}&rdquo;</blockquote>
                <p className="text-sm mt-3 text-ink-muted">— {quote.author}</p>
              </div>

              <div>
                {moodText}
                <MoodPicker
                  mood={mood}
                  onMoodChange={handleMoodChange}
                  open={showMoodPicker}
                  onOpenChange={setShowMoodPicker}
                />
              </div>

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
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-wax-light">
                        &#x2715;
                      </span>
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
            </div>

            <div className="relative z-3 flex flex-col gap-2 mt-6">
              <div className="flex items-center gap-4">
                <span className="text-ink-faint text-xs open-diary-wordcount">
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span className="text-ink-faint text-xs open-diary-wordcount">{charCount} chars</span>
                <div className="w-1.5 h-1.5 rounded-full ml-auto" />
              </div>
              {pageOneText}
            </div>
          </div>

          {diaryFold}

          <div className="open-diary-right open-diary-paper-texture w-1/2 max-[900px]:w-full relative shrink-0 rounded-r-3xl bg-journal-page">
            <div className="relative z-3 h-full flex flex-col px-8 pt-8 pb-12">
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Give this entry a title..."
                className="w-full bg-transparent font-display text-2xl font-light tracking-wide outline-none mb-4 text-ink"
              />

              {glitDimBorder}

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                placeholder="Dear diary, today I..."
                className="open-diary-textarea flex-1 min-h-105 bg-transparent text-ink caret-gilt resize-none text-base w-full border-none p-0 placeholder:italic placeholder:text-ink-faint"
                spellCheck={false}
              />
            </div>

            {diaryCurl}
            {pageTwoText}
          </div>
        </div>
      </div>
    </div>
  );
}

const backToEntries = (
  <button className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors duration-200 cursor-pointer group">
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm font-body">Back to entries</span>
  </button>
);
const diaryEdgeTop = <div className="open-diary-edge-top" />;
const diaryEdgeBottom = <div className="open-diary-edge-bottom" />;
const ornament = <p className="open-diary-ornament text-sm">&#x2022; &#x2022; &#x2022;</p>;
const hashIcon = <Hash size={11} strokeWidth={1.5} className="text-ink-faint" />;
const pageOneText = <span className="text-ink-faint text-sm">page 1</span>;
const diaryFold = (
  <div className="open-diary-fold relative w-px shrink-0 bg-diary-fold z-5 max-[900px]:hidden pointer-events-none" />
);
const glitDimBorder = <div className="w-16 mb-6 h-px bg-gilt-dim" />;
const diaryCurl = <div className="open-diary-curl" />;
const pageTwoText = (
  <div className="absolute bottom-4 right-0 left-0 flex justify-center z-3">
    <span className="text-ink-faint text-sm">page 2</span>
  </div>
);
const moodText = <p className="text-[12px] tracking-widest uppercase mb-3 text-ink-faint">Mood</p>;
