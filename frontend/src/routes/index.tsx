import { createFileRoute } from "@tanstack/react-router";
import Home from "@/features/public/home";
import CustomLoader from "@/components/custom-ui/custom-loader";
import CustomError from "@/components/custom-ui/custom-error";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
  
  },
  pendingComponent: ()=><CustomLoader />,
  errorComponent: () => <CustomError resourceName="a página" />,
  component: () => <Home key="home" />,
});
