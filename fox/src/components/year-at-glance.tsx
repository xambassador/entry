import { Ribbon } from "./ribbon";

const emojies = ["😊", "😌", "🤔", "😰", "🙏", "✨", "😴", "🎉", "🌧️", "🕊️"];

export function YearAtGlance() {
  return (
    <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-var(--nav-height))] py-10">
      <div className="relative w-full max-w-(--year-at-glance-width) mx-auto min-h-(--year-at-glance-height) h-full">
        <div className="flex rounded-l-3xl rounded-r-5xl bg-journal-surface min-h-(--year-at-glance-height) h-full w-full shadow-year-at-glance">
          <div className="min-w-[3%] h-full flex justify-end shrink-0">
            <div className="bg-shark w-0.5 h-full" />
          </div>

          <div className="flex-1 h-full flex flex-col items-center justify-center">
            <div className="grid grid-cols-[repeat(20,1fr)] justify-items-center gap-5 content-start">
              {Array.from({ length: 365 }).map((_, i) => (
                <button key={i} className="size-3 rounded-full bg-journal-card text-xl">
                  {emojies[Math.floor(Math.random() * emojies.length)]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-7">
          <Ribbon />
          <div className="absolute top-3 right-1/2 translate-x-1/2">
            <button className="relative size-20 rounded-full bg-linear-to-b from-twine to-driftwood shadow-xl">
              <span className="absolute inset-1 border-2 border-dashed border-white rounded-full" />
              <span>2026</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
