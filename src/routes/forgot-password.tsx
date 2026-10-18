import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth-form";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — LabelLens" },
      { name: "description", content: "Request a LabelLens password reset link." },
      { property: "og:title", content: "Reset password — LabelLens" },
      { property: "og:description", content: "Request a LabelLens password reset link." },
    ],
  }),
  component: ForgotPasswordForm,
});
