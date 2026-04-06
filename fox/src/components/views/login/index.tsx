import { useCallback, useRef, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { login } from "@/lib/api";

type Status = "idle" | "loading" | "error";

export function LoginApp() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const passphrase = inputRef.current?.value?.trim();
    if (!passphrase) {
      setError("Enter your passphrase");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await login(passphrase);
      window.location.href = res.write_url;
    } catch {
      setStatus("error");
      setError("Wrong passphrase");
      inputRef.current?.select();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse, var(--color-gilt), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="relative rounded-2xl bg-journal-surface border border-border overflow-hidden">
          <div className="open-diary-paper-texture absolute inset-0 rounded-2xl pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-shark" />

          <div className="relative z-10 px-10 py-12">
            <div className="text-center mb-10">
              <h1 className="font-handwriting text-4xl text-ink mb-1 tracking-wide">Entry</h1>
              <p className="open-diary-ornament text-sm mb-4">&bull; &bull; &bull;</p>
              <p className="text-ink-muted text-sm tracking-wide">Unlock your journal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="passphrase" className="sr-only">
                  Passphrase
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="passphrase"
                    name="passphrase"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    placeholder="Passphrase"
                    disabled={status === "loading"}
                    className="w-full bg-journal-dark/60 text-ink placeholder:text-ink-faint border border-border rounded-lg px-4 py-3 text-sm tracking-wide focus:outline-none focus:border-gilt-dim transition-colors duration-200 disabled:opacity-50"
                  />
                  <KeyRound
                    size={14}
                    strokeWidth={1.5}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[13px] text-wax text-center" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer select-none disabled:cursor-not-allowed bg-journal-card border border-journal-elevated text-ink-secondary hover:bg-journal-hover hover:text-ink active:scale-[0.98]"
              >
                {status === "loading" && <Loader2 size={15} className="animate-spin" />}
                <span>{status === "loading" ? "Unlocking..." : "Unlock"}</span>
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6 text-ink-faint text-xs tracking-widest uppercase">Private journal</p>
      </div>
    </div>
  );
}
