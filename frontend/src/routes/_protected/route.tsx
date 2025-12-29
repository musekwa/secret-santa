import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircleIcon } from "lucide-react";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    // Check if user ID exists in localStorage
    const userId = localStorage.getItem("secret_santa_participant");
    if (!userId) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
  pendingComponent: Spinner,
  errorComponent: AlertCircleIcon,
  component: () => <AuthenticatedLayout />,
});
