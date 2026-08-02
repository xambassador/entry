import type { GetYearAtGlanceResponse } from "@/types";

import { useCallback, useMemo, useRef, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { motion, useDragControls, useReducedMotion } from "motion/react";

import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";
import { buildMonthGrid } from "@/lib/date";

import { PolaroidCard } from "./polaroid-card";
import { YearTimeline } from "./year-timeline";

const route = getRouteApi("/year-at-glance");

const CARD_W = 320;
const CARD_H = 376;

const SLOTS = [
  { l: 20, t: 25 },
  { l: 75, t: 21 },
  { l: 47, t: 17 },
  { l: 14, t: 59 },
  { l: 84, t: 53 },
  { l: 31, t: 79 },
  { l: 67, t: 81 },
  { l: 88, t: 76 },
  { l: 12, t: 82 },
  { l: 53, t: 75 },
  { l: 34, t: 47 }
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placement = { l: number; t: number; tilt: number };

export function YeatAtGlance() {
  const { year, month } = route.useSearch();
  const { entries } = route.useLoaderData();
  const navigate = route.useNavigate();
  const reduce = useReducedMotion();
  const maxMonth = year === CURRENT_YEAR ? CURRENT_MONTH : 11;
  const months = useMemo(() => Array.from({ length: maxMonth + 1 }, (_, i) => i), [maxMonth]);
  const cellsByMonth = useMemo(() => months.map((m) => buildMonthGrid(year, m)), [months, year]);
  const glanceByMonth = useMemo(() => indexGlanceByMonth(entries), [entries]);

  const placements = useMemo(() => {
    const map = new Map<number, Placement>();
    const rand = mulberry32(year * 131 + months.length);
    let slot = 0;
    for (const m of months) {
      if (m === month) {
        map.set(m, { l: 50, t: 49, tilt: reduce ? 0 : (rand() - 0.5) * 5 });
        continue;
      }
      const s = SLOTS[slot % SLOTS.length];
      slot += 1;
      map.set(m, {
        l: s.l + (rand() - 0.5) * 5,
        t: s.t + (rand() - 0.5) * 5,
        tilt: reduce ? 0 : (rand() - 0.5) * 12
      });
    }
    return map;
  }, [months, year, month, reduce]);

  const [zMap, setZMap] = useState<Record<number, number>>({});
  const zTop = useRef(500);

  const bumpZ = useCallback((m: number) => {
    zTop.current += 1;
    setZMap((z) => ({ ...z, [m]: zTop.current }));
  }, []);

  const selectYear = (y: number) => {
    if (y === year) return;
    navigate({ search: (p) => ({ ...p, year: y }) });
  };

  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <YearTimeline year={year} onSelect={selectYear} />
      <div ref={constraintsRef} className="absolute inset-0">
        {months.map((m, i) => {
          const place = placements.get(m)!;
          const isCurrent = year === CURRENT_YEAR && m === CURRENT_MONTH;
          return (
            <ScatterCard
              key={m}
              m={m}
              index={i}
              year={year}
              place={place}
              z={zMap[m] ?? (m === month ? 60 : 40 + m)}
              isCurrent={isCurrent}
              cells={cellsByMonth[m]}
              glance={glanceByMonth.get(m)}
              constraintsRef={constraintsRef}
              onDragStart={() => bumpZ(m)}
            />
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 60%, rgba(60,45,30,0.06) 100%)" }}
      />
    </div>
  );
}

function ScatterCard({
  m,
  index,
  year,
  place,
  z,
  isCurrent,
  cells,
  glance,
  constraintsRef,
  onDragStart
}: {
  m: number;
  index: number;
  year: number;
  place: Placement;
  z: number;
  isCurrent: boolean;
  cells: ReturnType<typeof buildMonthGrid>;
  glance?: MonthGlance;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: () => void;
}) {
  const controls = useDragControls();

  return (
    <motion.div
      className="absolute touch-none z-[var(--z)] hover:z-[1000]"
      style={{
        left: `${place.l}%`,
        top: `${place.t}%`,
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
        ["--z" as string]: z
      }}
      transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.8, delay: Math.min(index * 0.025, 0.2) }}
      dragListener={false}
      dragControls={controls}
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      dragTransition={{ power: 0.2, timeConstant: 200, bounceStiffness: 200, bounceDamping: 32 }}
      drag
      dragMomentum
      onDragStart={onDragStart}
    >
      <div
        className="rotate-[var(--tilt)] transition-transform duration-300 ease-out hover:scale-[1.08] hover:rotate-0 motion-reduce:transition-none"
        style={{ ["--tilt" as string]: `${place.tilt}deg` }}
      >
        <PolaroidCard
          month={m}
          year={year}
          cells={cells}
          glance={glance}
          isCurrent={isCurrent}
          onDragHandlePointerDown={(e) => controls.start(e)}
        />
      </div>
    </motion.div>
  );
}

type GlanceEntry = GetYearAtGlanceResponse["entries"][number];
export type MonthGlance = {
  byDate: Map<string, GlanceEntry>;
};

function indexGlanceByMonth(entries: GlanceEntry[]): Map<number, MonthGlance> {
  const map = new Map<number, MonthGlance>();
  for (const e of entries) {
    const month = Number(e.date.slice(5, 7)) - 1;
    if (Number.isNaN(month)) continue;
    let bucket = map.get(month);
    if (!bucket) {
      bucket = { byDate: new Map() };
      map.set(month, bucket);
    }
    bucket.byDate.set(e.date, e);
  }
  return map;
}
