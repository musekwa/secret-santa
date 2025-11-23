import { createFileRoute,  redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({context}) => {
    if (!context.user){
      // throw redirect({
      //   to: '/login',
      //   search: {
      //     redirect: location.href,
      //   },
      // });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
  component: () => <AuthenticatedLayout />,
})
