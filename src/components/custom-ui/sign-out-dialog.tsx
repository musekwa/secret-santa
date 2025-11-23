import { useNavigate, useLocation } from "@tanstack/react-router";
import { clearUserFromStorage } from "@/hooks/use-user";
import { ConfirmDialog } from "@/components/custom-ui/confirm-dialog";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignOutDialog = ({ open, onOpenChange }: SignOutDialogProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    // Clear user info from localStorage
    clearUserFromStorage();

    // Preserve current location for redirect after sign-in
    const currentPath = location.href;
    navigate({
      to: "/login",
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
