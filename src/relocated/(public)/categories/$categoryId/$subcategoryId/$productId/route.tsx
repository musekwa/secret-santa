import { createFileRoute, notFound } from '@tanstack/react-router'
import { getProduct } from '../../../../../../lib/mock';

export const Route = createFileRoute(
  '/(public)/categories/$categoryId/$subcategoryId/$productId',
)({
  component: RouteComponent,
  loader: async ({ params: { productId } }) => {
    const product = await getProduct(productId);

    if (!product) {
      throw notFound();
    }
    return { product };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
  const { product } = Route.useLoaderData();
  return (
    <div className="space-y-3">
      <h2 className="heading">Product</h2>
      <div className="card">
        <span className="title">{product.name}</span>
        <span className="price">{product.price}</span>
        <span className="description">{product.description}</span>
      </div>
    </div>
  );
}
