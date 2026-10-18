import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — LabelLens" },
      { name: "description", content: "Log in to LabelLens to see saved scans." },
      { property: "og:title", content: "Log in — LabelLens" },
      { property: "og:description", content: "Log in to LabelLens to see saved scans." },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
