import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/auth-form";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — LabelLens" },
      { name: "description", content: "Set a new LabelLens password." },
      { property: "og:title", content: "Choose a new password — LabelLens" },
      { property: "og:description", content: "Set a new LabelLens password." },
    ],
  }),
  component: ResetPasswordForm,
});
