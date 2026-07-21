/**
 * Product Catalog Data for E-Commerce Store matching exact layout specs
 */

export interface ProductItem {
  id: string;
  name: string;
  category: 'apparel' | 'furniture';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: 'Promotion' | 'New' | 'Customer favorite' | '3D Configurable';
  description: string;
  imageUrl: string;
  colorSwatches: string[];
  configuratorKey?: string;
  tags: string[];
}

export const CATALOG_PRODUCTS: ProductItem[] = [
  // APPAREL CATEGORY
  {
    id: 'apparel-tshirt',
    name: 'Custom Heavyweight Streetwear Tee',
    category: 'apparel',
    price: 43.85,
    rating: 4.9,
    reviewCount: 128,
    badge: '3D Configurable',
    description: '100% Premium Organic Cotton with 3D live print preview canvas.',
    imageUrl: '/t-shirt/hero.webp',
    colorSwatches: ['#18181b', '#3f3f46', '#a1a1aa'],
    configuratorKey: 'apparel',
    tags: ['Streetwear', 'Cotton', 'Print']
  },
  {
    id: 'apparel-cap',
    name: 'Urban Structured 6-Panel Cap',
    category: 'apparel',
    price: 34.50,
    rating: 4.8,
    reviewCount: 94,
    badge: 'New',
    description: 'Custom embroidered front panel with breathable eyelets.',
    imageUrl: '/cap/hero.webp',
    colorSwatches: ['#09090b', '#27272a', '#71717a'],
    configuratorKey: 'cap',
    tags: ['Headwear', 'Accessories', 'Custom']
  },
  {
    id: 'apparel-card',
    name: 'Luxury Velvet Finish Business Card',
    category: 'apparel',
    price: 19.99,
    rating: 4.9,
    reviewCount: 210,
    badge: 'Customer favorite',
    description: 'Soft-touch velvet coated card stock with high-end metallic foil layout.',
    imageUrl: '/business-card/hero.webp',
    colorSwatches: ['#1e1b4b', '#312e81', '#6366f1'],
    configuratorKey: 'businesscard',
    tags: ['Stationery', 'Branding', 'Print']
  },
  {
    id: 'apparel-hoodie',
    name: 'Cyberpunk Reflective Oversized Hoodie',
    category: 'apparel',
    price: 89.00,
    rating: 4.9,
    reviewCount: 76,
    badge: 'Promotion',
    description: 'Heavy fleece lined dark hoodie with water-resistant coating.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    colorSwatches: ['#18181b', '#52525b', '#d4d4d8'],
    tags: ['Hoodie', 'Winter', 'Darkwear']
  },

  // FURNITURE CATEGORY
  {
    id: 'furn-chair-1',
    name: 'Nordic Velvet Armchair',
    category: 'furniture',
    price: 299.00,
    rating: 4.9,
    reviewCount: 164,
    badge: 'Customer favorite',
    description: 'High-density foam cushion with matte black steel frame.',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop',
    colorSwatches: ['#2e3d34', '#586b5c', '#9fb3a3'],
    tags: ['Seating', 'Living Room', 'Velvet']
  },
  {
    id: 'furn-desk-1',
    name: 'Minimalist Natural Walnut Studio Desk',
    category: 'furniture',
    price: 449.00,
    rating: 4.8,
    reviewCount: 88,
    badge: 'New',
    description: 'Solid walnut timber desk with integrated wire routing channels.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop',
    colorSwatches: ['#451a03', '#78350f', '#d97706'],
    tags: ['Office', 'Workspace', 'Wood']
  },
  {
    id: 'furn-table-1',
    name: 'Modern Ceramic Stone Coffee Table',
    category: 'furniture',
    price: 189.50,
    rating: 4.7,
    reviewCount: 43,
    badge: 'Promotion',
    description: 'Scratch-resistant slate ceramic stone tabletop.',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop',
    colorSwatches: ['#1f2937', '#4b5563', '#9ca3af'],
    tags: ['Tables', 'Ceramic', 'Modern']
  },
  {
    id: 'furn-lounge-1',
    name: 'Scandinavian Bouclé Curved Sofa',
    category: 'furniture',
    price: 699.00,
    rating: 4.9,
    reviewCount: 31,
    badge: 'Customer favorite',
    description: 'Organic sculptural curve sofa wrapped in textured ivory bouclé wool fabric.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    colorSwatches: ['#f3f4f6', '#d1d5db', '#6b7280'],
    tags: ['Sofa', 'Bouclé', 'Scandinavian']
  }
];
