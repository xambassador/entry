import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

interface Props {
  error: unknown;
}

const STATUS_TITLES: Record<number, string> = {
  404: "Not found",
  401: "Unauthorized",
  403: "Forbidden",
  408: "Request timeout",
  429: "Too many requests",
  500: "Server error",
  502: "Bad gateway",
  503: "Service unavailable"
};

export function RouteError({ error }: Props) {
  const router = useRouter();
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);
  const title = status ? (STATUS_TITLES[status] ?? `Error ${status}`) : "Something went wrong";

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-wax-seal/20 text-wax">
          <AlertTriangle className="size-5" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-medium text-ink tracking-wide">{title}</h2>
          <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-border text-ink-muted hover:text-ink hover:bg-journal-hover transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            <span>Go back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
