import { createFileRoute, Link, notFound, Outlet } from '@tanstack/react-router'
import { getProducts, type Product } from '../../../../../lib/mock';

export const Route = createFileRoute(
  '/(public)/categories/$categoryId/$subcategoryId',
)({
  component: RouteComponent,
  loader: async ({ params: { subcategoryId } }) => {
    const products = await getProducts(subcategoryId);
    if (!products || products.length === 0) {
      throw notFound();
    }
    return { products };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const { products } = Route.useLoaderData();
  return (
    <div className="space-y-3">
      <h2 className="heading">Products</h2>
      <div className="list">
        {products.map((product: Product) => (
          <Link key={product.id} to={"/categories/$categoryId/$subcategoryId/$productId"} params={{ productId: product.id.toString() }} className="card"
          activeProps={{ className: "active-card" }}
          from={"/categories/$categoryId/$subcategoryId"}
          hash="product-details"
          >
            <span className="title">{product.name}</span>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
