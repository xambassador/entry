import { useEffect } from "react";

import { updateContent, updateTitle } from "./store";

export function TitleInput(props: { title?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { title: defaultValue, ...rest } = props;

  useEffect(() => {
    updateTitle(defaultValue || "");
  }, [defaultValue]);

  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder="Give this entry a title..."
      {...rest}
      onChange={(e) => {
        updateTitle(e.target.value);
        rest.onChange?.(e);
      }}
    />
  );
}

export function ContentInput(props: { content?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { content: defaultValue, ...rest } = props;

  useEffect(() => {
    updateContent(defaultValue || "");
  }, [defaultValue]);

  return (
    <textarea
      defaultValue={defaultValue}
      placeholder="Dear diary, today I..."
      {...rest}
      onChange={(e) => {
        updateContent(e.target.value);
        rest.onChange?.(e);
      }}
    />
  );
}
