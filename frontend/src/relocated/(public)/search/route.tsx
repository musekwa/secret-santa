import { createFileRoute, Link } from "@tanstack/react-router";
import { searchSchema } from "./-types/searchSchema";
import { searchProducts } from "../../../lib/mock";
import FilterPanel from "./-components/filter-panel";

export const Route = createFileRoute("/(public)/search")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    const products = await searchProducts(search);
    return { products };
  },
});

function RouteComponent() {
  const { products } = Route.useLoaderData();
  return (
    <>
      <FilterPanel />
      <h2 className="heading">Search</h2>
      <div className="list">
        {products.map((product) => (
          <Link
            key={product.id}
            to={"/categories/$categoryId/$subcategoryId/$productId"}
            params={{
              categoryId: product.categoryId.toString(),
              subcategoryId: product.subcategoryId.toString(),
              productId: product.id.toString(),
            }}
            className="card"
            activeProps={{ className: "active-card" }}
            from={"/search"}
            hash="product-details"
          >
            <p className="title">{product.name}</p>
            <p className="price">{product.price}</p>
            <p className="description">{product.description}</p>
          </Link>
        ))}
      </div>


    </>
  );
}
