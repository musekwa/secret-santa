import {
  createFileRoute,
  Link,
  notFound,
  Outlet,
} from "@tanstack/react-router";
import { getSubcategories, type Subcategory } from "../../../../lib/mock";

export const Route = createFileRoute("/(public)/categories/$categoryId")({
  component: RouteComponent,
  loader: async ({ params: { categoryId } }) => {
    const subcategories = await getSubcategories(categoryId);
    if (!subcategories) {
      throw notFound();
    }
    return { subcategories };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const { subcategories } = Route.useLoaderData();
  return (
    <div className="space-y-3">
      <h2 className="heading">Subcategories</h2>
      <div className="list">
        {subcategories.map((subcategory: Subcategory) => (
          <Link
            activeProps={{ className: "active-card" }}
            from={"/categories/$categoryId"}
            key={subcategory.id}
            to={"/categories/$categoryId/$subcategoryId"}
            params={{ subcategoryId: subcategory.id }}
            className="card"
          >
            <span className="title">{subcategory.name}</span>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
