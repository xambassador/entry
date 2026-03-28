import { createFileRoute } from "@tanstack/react-router";

import { Editor } from "@/components/views/editor/editor";

export const Route = createFileRoute("/write")({ component: Editor });
