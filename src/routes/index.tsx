import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async ({context}) => {
    throw redirect({
      to: '/dashboard',
    });
    if(!context.user){
      
    }
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
  component: () => <Outlet />,
})

