import { useLogin } from "@/hooks/use-login";
import { Loader2 } from "lucide-react";

export function LoginApp() {
  const controls = useLogin();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-96 rounded-full"
          style={{ background: "radial-gradient(ellipse, oklch(0.790 0.140 72 / 4%) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-login-card-in">
        <div className="rounded-xl bg-surface border border-border overflow-hidden">
          <div className="px-10 py-12">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-semibold text-ink tracking-tight mb-1">Entry</h1>
              <p className="text-sm text-ink-muted">Your private journal</p>
            </div>

            <form {...controls.getFormProps({ className: "space-y-4" })}>
              <div>
                <label htmlFor="passphrase" className="sr-only">
                  Passphrase
                </label>
                <input
                  {...controls.getInputProps({
                    id: "passphrase",
                    name: "passphrase",
                    type: "password",
                    placeholder: "Enter passphrase",
                    className:
                      "w-full bg-canvas text-ink placeholder:text-ink-faint border border-border rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 disabled:opacity-50 transition-[border-color,box-shadow,opacity] duration-200 ease-active"
                  })}
                />
              </div>

              {controls.error && (
                <p className="text-[13px] text-danger text-center" role="alert">
                  {controls.error}
                </p>
              )}

              <button
                {...controls.getButtonProps({
                  className:
                    "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-sm font-semibold cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-60 bg-accent text-canvas hover:brightness-110 active:scale-[0.96] transition-[filter,transform] duration-150 ease-active"
                })}
              >
                {controls.status === "loading" && <Loader2 size={15} className="animate-spin" />}
                <span>{controls.status === "loading" ? "Unlocking..." : "Unlock"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
