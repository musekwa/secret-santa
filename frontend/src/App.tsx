import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
// import { useRootContext } from "./hooks/use-context";
// import { useUser } from "./features/use-user";

const router = createRouter({
  routeTree: routeTree,
  defaultPendingMs: 0,
  defaultPreload: "intent",
  context: {
    user: null,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  // const user = useUser();
  return (
    <RouterProvider
      router={router}
      context={{
        // user: user,
      }}
    />
  );
}

export default App;
