import { useNavigate, useLocation } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/custom-ui/confirm-dialog";
import AuthApi from "@/lib/api/auth.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { findMeQueryOptions } from "@/lib/query-options/auth.query-options";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignOutDialog = ({ open, onOpenChange }: SignOutDialogProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const handleSignOut = async () => {
    // Clear user info from localStorage
    // clearUserFromStorage();
    const { success, message } = await AuthApi.signOut();
    if (!success) {
      console.error(message);
      return;
    }
    onOpenChange(false);

    // Immediately clear the user data from cache so navbar updates instantly
    queryClient.setQueryData(["user"], null);
    // Cancel any in-flight queries
    queryClient.cancelQueries({ queryKey: ["user"] });
    // Remove queries from cache
    queryClient.removeQueries({ queryKey: ["user"] });

    // Preserve current location for redirect after sign-in
    const currentPath = location.href;
    navigate({
      to: "/",
      search: { redirect: currentPath },
      replace: true,
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sair"
      desc="Tem certeza de que deseja sair? Você precisará fazer login novamente para acessar sua conta."
      confirmText="Sair"
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
};
