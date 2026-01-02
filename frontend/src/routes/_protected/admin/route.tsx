import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
// import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/_protected/admin")({
  beforeLoad: async () => {
    // Check if user ID exists in localStorage
    const userId = localStorage.getItem("secret_santa_participant");
    if (!userId) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }

    // // Check if user is admin
    // const { data: participant, error } = await supabase
    //   .from("participants")
    //   .select("is_admin, email")
    //   .eq("id", userId)
    //   .single();

    // if (error || !participant) {
    //   throw redirect({
    //     to: "/dashboard",
    //     replace: true,
    //   });
    // }

    // // Only allow admin email: musekwa2011@gmail.com
    // const isAdmin =
    //   participant.is_admin === true ||
    //   participant.email === "musekwa2011@gmail.com";

    // if (!isAdmin) {
    //   throw redirect({
    //     to: "/dashboard",
    //     replace: true,
    //   });
    // }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
