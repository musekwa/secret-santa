import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/client/files/$/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/client/files/$/"!</div>
}
