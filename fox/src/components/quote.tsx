const quote = {
  text: "One day I will find the right words, and they will be simple.",
  author: "Jack Kerouac"
};

export function Quote() {
  return (
    <div>
      <blockquote className="leading-relaxed text-ink-secondary">&ldquo;{quote.text}&rdquo;</blockquote>
      <p className="text-sm mt-3 text-ink-muted">— {quote.author}</p>
    </div>
  );
}
