import type { Components } from "react-markdown";

function tiltFrom(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return ((Math.abs(h) % 5) - 2) * 1.3;
}

export const mdComponents: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all">
      {children}
    </a>
  ),
  img: ({ src, alt }) => {
    const tilt = tiltFrom(String(src ?? alt ?? ""));
    return (
      <span className="my-5 flex justify-center">
        <span
          className="inline-block max-w-full bg-white p-2.5 pb-3 shadow-md"
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          <img
            src={typeof src === "string" ? src : undefined}
            alt={alt ?? ""}
            loading="lazy"
            className="block h-auto max-h-[340px] w-auto max-w-full rounded-[1px] sm:max-w-[300px] sm:w-75 object-cover"
          />
          {alt && (
            <span className="block pt-2 text-center font-hand text-lg leading-none text-ink-secondary">{alt}</span>
          )}
        </span>
      </span>
    );
  }
};
