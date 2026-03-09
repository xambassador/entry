import { cn } from "@/lib/cn";

import { Ribbon } from "./ribbon";

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> & {
  shellProps?: React.HTMLAttributes<HTMLDivElement>;
};

export function DiaryCover(props: Props) {
  const { children, className, shellProps, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "w-full max-w-(--year-at-glance-width) mx-auto min-h-(--year-at-glance-height) h-full max-h-200",
        className
      )}
    >
      <div className="size-full relative">
        <div className="flex rounded-l-3xl rounded-r-5xl bg-journal-surface h-full w-full shadow-year-at-glance">
          <div className="min-w-[3%] h-full flex justify-end shrink-0">
            <div className="bg-shark w-0.5 h-full" />
          </div>

          <div
            {...shellProps}
            className={cn("flex-1 h-full flex flex-col items-center justify-center", shellProps?.className)}
          >
            {children}
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
