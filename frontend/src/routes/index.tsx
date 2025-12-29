import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // Check if user ID exists in localStorage
    const userId = localStorage.getItem("secret_santa_participant");
    if (!userId) {
      throw redirect({ to: "/login", replace: true });
    }
    throw redirect({
      to: "/dashboard",
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
  component: () => <Outlet />,
});
