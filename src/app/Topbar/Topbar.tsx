/**
 * CE.SDK Mockup Editor - Topbar
 *
 * Contains the product selector for switching between product types and back to store navigation.
 */

import { ProductSelector } from '../ProductSelector/ProductSelector';
import { PRODUCTS } from '../constants';

interface TopbarProps {
  currentProductKey: string;
  onProductChange: (productKey: string) => Promise<void>;
  disabled?: boolean;
  onBackToStore?: () => void;
}

export function Topbar({
  currentProductKey,
  onProductChange,
  disabled = false,
  onBackToStore
}: TopbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        background: '#0e0e12',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {onBackToStore ? (
        <button
          onClick={onBackToStore}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '0.4rem 0.9rem',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease'
          }}
        >
          ← Back to Store
        </button>
      ) : (
        <div />
      )}

      <ProductSelector
        products={PRODUCTS}
        currentProduct={currentProductKey}
        onProductChange={onProductChange}
        disabled={disabled}
      />

      <div style={{ width: '110px' }} />
    </div>
  );
}

export { type TopbarProps };
