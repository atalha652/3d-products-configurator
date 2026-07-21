/**
 * CE.SDK Mockup Editor Starterkit - React Entry Point
 *
 * A mockup editor that renders designs on product mockups in real-time.
 */

import type { Configuration } from '@cesdk/cesdk-js';
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

// ============================================================================
const config: Configuration = {
  userId: 'starterkit-3d-product-preview-user',

  // Local assets for development
};

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

// ============================================================================
// Render
// ============================================================================

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
      <Route path="/product/:id/canvas" element={<App config={config} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
