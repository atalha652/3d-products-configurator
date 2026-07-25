/**
 * 3D Apparel Configurator - React Entry Point
 */

import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams
} from 'react-router-dom';
import App from './app/App';
import { LandingPage } from './landing/LandingPage';
import { ProductDetailPage } from './landing/ProductDetailPage';
import { CATALOG_PRODUCTS, ProductItem } from './landing/catalog';

function HomePage() {
  const navigate = useNavigate();

  return (
    <LandingPage
      onSelectProductItem={(product: ProductItem) =>
        navigate(`/shop/${product.id}`)
      }
      onLaunchStudio={() => navigate('/product/apparel/canvas')}
    />
  );
}

function ProductDetailRoute() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = CATALOG_PRODUCTS.find((item) => item.id === productId);

  if (!product) {
    return <Navigate to="/" replace />;
  }

  return (
    <ProductDetailPage
      product={product}
      onBack={() => navigate('/')}
      onOpen3DStudio={(productKey) =>
        navigate(`/product/${productKey}/canvas`)
      }
    />
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop/:productId" element={<ProductDetailRoute />} />
      <Route path="/product/:id/canvas" element={<App />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
