import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { User } from "../types/auth.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/layouts/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/layouts/footer";

const queryClient = new QueryClient();

export type RootContext = {
  user: User | null;
};

export const Route = createRootRouteWithContext<RootContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Outlet />
        <Footer />
        <Toaster />
      </QueryClientProvider>
      <TanStackRouterDevtools />
    </>
  );
}
