import { Outlet } from "@tanstack/react-router";
import { LayoutProvider } from "@/context/layout-provider";
import { SearchProvider } from "@/context/search-provider";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";

type AuthenticatedLayoutProps = {
  children?: React.ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <SearchProvider>
      <LayoutProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children ?? <Outlet />}</main>
          <Footer />
        </div>
      </LayoutProvider>
    </SearchProvider>
  );
}
