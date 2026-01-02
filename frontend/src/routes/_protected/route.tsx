import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";
import CustomLoader from "@/components/custom-ui/custom-loader";
import CustomError from "@/components/custom-ui/custom-error";
import { requireAuth } from "@/lib/utils/auth.utils";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const user = await requireAuth("/login");
    return { user };
  },
  pendingComponent: CustomLoader,
  errorComponent: () => <CustomError resourceName="a página" />,
  component: () => <AuthenticatedLayout />,
});
