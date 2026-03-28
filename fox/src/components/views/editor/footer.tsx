import { useContent } from "./store";

export function WordCount(props: { content?: string }) {
  const { content: defaultContent } = props;
  const content = useContent();
  let wordCount = content ? content.trim().split(/\s+/).length : 0;
  if (!content && defaultContent) {
    wordCount = defaultContent.trim() ? defaultContent.trim().split(/\s+/).length : 0;
  }

  return (
    <span className="text-ink-faint text-xs open-diary-wordcount">
      {wordCount} {wordCount === 1 ? "word" : "words"}
    </span>
  );
}

export function CharCount(props: { content?: string }) {
  const { content: defaultContent } = props;
  const content = useContent();
  let charCount = content.length;
  if (!content && defaultContent) {
    charCount = defaultContent.length;
  }

  return <span className="text-ink-faint text-xs open-diary-wordcount">{charCount} chars</span>;
}
