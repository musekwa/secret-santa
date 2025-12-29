import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/admin')({
  component: RouteComponent,
  beforeLoad: async ({context}) => {
    if (!context.isAdmin){
      throw redirect({
        to: '/client',
      });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
})

function RouteComponent() {
  return <Outlet />;
}
