export function PhotoBadge({ image, tilt }: { image: string; tilt: number }) {
  return (
    <div
      className="pointer-events-none absolute top-6 right-1.5 z-20 w-24 max-h-[100px] rounded-[2px] bg-white p-1 pb-2 shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="aspect-square w-full overflow-hidden rounded-[1px] bg-black/5">
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
