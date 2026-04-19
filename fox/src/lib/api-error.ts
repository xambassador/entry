import type { ResponseError } from "up-fetch";

import { isResponseError } from "up-fetch";

interface ServerErrorBody {
  error: { code: string; message: string };
}

function isServerError(err: unknown): err is ResponseError<ServerErrorBody> {
  return (
    isResponseError(err) &&
    typeof err.data === "object" &&
    err.data !== null &&
    "error" in err.data &&
    typeof (err.data as ServerErrorBody).error?.message === "string"
  );
}

export function getErrorMessage(err: unknown): string {
  if (isServerError(err)) return err.data.error.message;
  if (isResponseError(err)) return `Request failed (${err.status})`;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export function getErrorCode(err: unknown): string | undefined {
  if (isServerError(err)) return err.data.error.code;
  return undefined;
}

export function isErrorCode(err: unknown, code: string): boolean {
  return getErrorCode(err) === code;
}

export function getErrorStatus(err: unknown): number | undefined {
  if (isResponseError(err)) return err.status;
  return undefined;
}
