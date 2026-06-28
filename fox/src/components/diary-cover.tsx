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
      className={cn("w-full max-w-(--content-max-width) mx-auto h-full", className)}
    >
      <div className="relative size-full">
        <div className="bg-surface rounded-xl h-full w-full border border-border">
          <div
            {...shellProps}
            className={cn(
              "h-full flex flex-col items-center justify-center w-full overflow-hidden",
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
