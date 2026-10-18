import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — LabelLens" },
      { name: "description", content: "Create a LabelLens account to save your scans." },
      { property: "og:title", content: "Sign up — LabelLens" },
      { property: "og:description", content: "Create a LabelLens account to save your scans." },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
