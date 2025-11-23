import { cn } from "@/lib/utils";
import { NavbarUser } from "./navbar-user";
import { useUser } from "@/hooks/use-user";
import iamLogo from "@/assets/images/iam-logo.png";
import { Link, useLocation } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, Upload, Users } from "lucide-react";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const user = useUser();
  const location = useLocation();
  const isAdmin =
    user?.is_admin === true || user?.email === "musekwa2011@gmail.com";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-primary/20 bg-primary text-primary-foreground",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={iamLogo}
              alt="IAM, IP"
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary-foreground leading-tight">
                IAM, IP
              </h1>
              <p className="text-xs text-primary-foreground/80 leading-tight">
                Amigos Ocultos
              </p>
            </div>
          </Link>

          {/* Admin Navigation Menu */}
          {isAdmin && (
            <div className="flex items-center gap-4 border-l border-primary-foreground/20 pl-6 justify-end">
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/dashboard"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/upload-participants"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/admin/upload-participants"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <Upload className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/participants"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/admin/participants"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <Users className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <NavbarUser user={user} />
          ) : (
            <Skeleton className="h-10 w-32 rounded-md bg-primary-foreground/20" />
          )}
        </div>
      </div>
    </nav>
  );
}
