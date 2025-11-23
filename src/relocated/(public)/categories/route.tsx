import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { getCategories, type Category } from "../../../lib/mock";

export const Route = createFileRoute("/(public)/categories")({
  component: RouteComponent,
  loader: async () => {
    const categories = await getCategories();
    return { categories };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const { categories } = Route.useLoaderData();
  return (
    <div className="space-y-3">
      <h2 className="heading">Categories</h2>
      <div className="list">
        {categories.map((category: Category) => (
          <Link
            activeProps={{ className: "active-card" }}
            from={"/categories"}
            to={"/categories/$categoryId"}
            params={{ categoryId: category.id }}
            key={category.id}
            className="card"
          >
            <span className="title">{category.name}</span>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
