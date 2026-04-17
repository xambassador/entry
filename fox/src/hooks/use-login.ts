import { useCallback, useRef, useState } from "react";

import { login } from "@/lib/api";

type Status = "idle" | "loading" | "error";
type InputProps = React.ComponentProps<"input">;
type ButtonProps = React.ComponentProps<"button">;
type FormProps = React.ComponentProps<"form">;

export function useLogin() {
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

  function getInputProps(props?: InputProps): InputProps {
    return {
      ...props,
      ref: inputRef,
      autoComplete: "current-password",
      autoFocus: true,
      disabled: status === "loading"
    };
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return { type: "submit", ...props, disabled: status === "loading" };
  }

  function getFormProps(props?: FormProps): FormProps {
    return { ...props, onSubmit: handleSubmit };
  }

  return { getInputProps, getButtonProps, getFormProps, error, status };
}
