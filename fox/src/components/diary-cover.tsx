import { cn } from "@/lib/cn";

type Props = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> & {
  shellProps?: React.HTMLAttributes<HTMLDivElement>;
  overlay?: React.ReactNode;
};

export function DiaryCover(props: Props) {
  const { children, className, shellProps, overlay, ...rest } = props;
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
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center w-full overflow-hidden",
              shellProps?.className
            )}
          >
            {children}
          </div>
        </div>

        {overlay}
      </div>
    </div>
  );
}
