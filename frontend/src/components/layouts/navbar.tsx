import { cn } from "@/lib/utils";
import { NavbarUser } from "./navbar-user";
// import { useUser } from "@/features/use-user";
import logoImage from "@/assets/images/logo.png";
import { Link, useLocation } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, Upload, Users } from "lucide-react";
import { findMeQueryOptions } from "@/lib/query-options/auth.query-options";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const { data: user } = useQuery(findMeQueryOptions());
  const location = useLocation();

  console.log("user", user);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-primary/20 bg-primary text-primary-foreground",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex flex-1 items-center">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={logoImage}
              alt="tecmoza"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary-foreground leading-tight">
                AMICULTO
              </h1>
              <p className="text-xs text-primary-foreground/80 leading-tight">
                Sistema de Gestão de Amigos Ocultos
              </p>
            </div>
          </Link>

          {/* Admin Navigation Menu */}
          {/* {isAdmin && ( */}
            {/* <div className="flex items-center gap-4 border-l border-primary-foreground/20 pl-6 justify-end">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
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
            </div> */}
          {/* )} */}
        </div>
        <div className="">
          {user ? (
            <NavbarUser user={user} />
          ) : (
            <Button variant="default" size="sm" className="border-2 border-white items-center justify-center">
              <Link to="/login" className="text-primary-foreground flex items-center justify-center">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
