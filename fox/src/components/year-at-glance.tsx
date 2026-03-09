import { DiaryCover } from "./diary-cover";

const emojies = ["😊", "😌", "🤔", "😰", "🙏", "✨", "😴", "🎉", "🌧️", "🕊️"];

export function YearAtGlance() {
  return (
    <DiaryCover>
      <div className="grid grid-cols-[repeat(20,1fr)] justify-items-center gap-5 content-start">
        {Array.from({ length: 365 }).map((_, i) => (
          <button
            key={i}
            className="size-3 rounded-full text-xl opacity-50 cursor-pointer hover:opacity-100 transition-opacity"
          >
            {emojies[Math.floor(Math.random() * emojies.length)]}
          </button>
        ))}
      </div>
    </DiaryCover>
  );
}
