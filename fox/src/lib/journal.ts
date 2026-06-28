import type { Entry } from "@/types";

export type NoteColor = {
  name: string;
  bg: string;
  ink: string;
  muted: string;
};

export type JournalVariant = "sticky" | "polaroid" | "postcard";

export type JournalNote = {
  id: string;
  href?: string;
  title: string;
  excerpt: string;
  emoji: string;
  color: NoteColor;
  variant: JournalVariant;
  image?: string;
  tilt: number;
};

const NOTE_COLORS: NoteColor[] = [
  { name: "pink", bg: "#F7D6F4", ink: "#4a3348", muted: "#8a6f86" },
  { name: "green", bg: "#CBEFCB", ink: "#2f4630", muted: "#6d8a6d" },
  { name: "purple", bg: "#DBD5F8", ink: "#3a3560", muted: "#736e99" },
  { name: "neutral", bg: "#E8E8E8", ink: "#3a3a3a", muted: "#828282" }
];

export const POSTCARD_COLOR: NoteColor = { name: "salmon", bg: "#E7A08C", ink: "#5a2e22", muted: "#814b3c" };

function svg(markup: string) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}

export const PHOTOS = {
  portrait: svg(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='240'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#f7cdaa'/><stop offset='1' stop-color='#c6866a'/></linearGradient></defs><rect width='200' height='240' fill='url(#g)'/><circle cx='100' cy='94' r='44' fill='#f4dcc6'/><rect x='52' y='150' width='96' height='90' rx='48' fill='#3a2f2a'/></svg>`
  ),
  building: svg(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='180'><defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#bfe3f5'/><stop offset='1' stop-color='#e9f4fb'/></linearGradient></defs><rect width='240' height='180' fill='url(#s)'/><rect x='70' y='70' width='100' height='110' fill='#f4efe6'/><path d='M70 70 L120 34 L170 70 Z' fill='#e7ddcd'/><circle cx='120' cy='56' r='12' fill='#dccdb6'/><rect x='96' y='110' width='18' height='70' fill='#cabfad'/><rect x='126' y='110' width='18' height='70' fill='#cabfad'/></svg>`
  ),
  landscape: svg(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='180'><defs><linearGradient id='k' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#cdeaf6'/><stop offset='1' stop-color='#eaf6ee'/></linearGradient></defs><rect width='240' height='180' fill='url(#k)'/><circle cx='190' cy='46' r='22' fill='#f6e2a8'/><path d='M0 180 L0 120 Q80 80 150 118 T240 112 L240 180 Z' fill='#9ccb8f'/><path d='M0 180 L0 148 Q90 118 170 146 T240 140 L240 180 Z' fill='#7cb673'/></svg>`
  )
};

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function decorate(entry: Entry): JournalNote {
  const h = hash(entry.id || entry.date);
  const variant: JournalVariant = h % 6 === 0 ? "postcard" : h % 4 === 0 ? "polaroid" : "sticky";
  const photoKeys = Object.keys(PHOTOS) as (keyof typeof PHOTOS)[];

  return {
    id: entry.id,
    href: entry.id,
    title: entry.title || "Untitled",
    excerpt: "",
    emoji: entry.emoji,
    color: variant === "postcard" ? POSTCARD_COLOR : NOTE_COLORS[h % NOTE_COLORS.length],
    variant,
    image: variant === "sticky" ? undefined : PHOTOS[photoKeys[h % photoKeys.length]],
    tilt: ((h % 5) - 2) * 0.9
  };
}

export function indexByDate(entries: Entry[]): Map<string, Entry> {
  return new Map(entries.map((e) => [e.date, e]));
}
