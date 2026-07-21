/**
 * CE.SDK Mockup Editor Starterkit - React Entry Point
 *
 * A mockup editor that renders designs on product mockups in real-time.
 */

import type { Configuration } from '@cesdk/cesdk-js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './app/App';

// ============================================================================
const config: Configuration = {
  userId: 'starterkit-3d-product-preview-user',

  // Local assets for development
};

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
      <Route path="/product/:id/canvas" element={<App config={config} />} />
      <Route path="*" element={<Navigate to="/product/apparel/canvas" replace />} />
    </Routes>
  </BrowserRouter>
);
