import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/client')({
  component: RouteComponent,
  beforeLoad: async ({context}) => {
    if (!context.isClient){
      throw redirect({
        to: '/admin',
      });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
})

function RouteComponent() {
  return <Outlet />;
}
