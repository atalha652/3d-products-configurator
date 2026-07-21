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
  badge?: 'Promotion' | 'New' | 'Customer favorite' | '3D Configurable' | 'Coming Soon';
  description: string;
  imageUrl: string;
  galleryImages: string[];
  colorSwatches: string[];
  configuratorKey?: string;
  tags: string[];
  features?: string[];
  isDisabled?: boolean;
}

export const CATALOG_PRODUCTS: ProductItem[] = [
  // APPAREL CATEGORY
  {
    id: 'apparel-tshirt',
    name: 'Custom Heavyweight Streetwear Tee',
    category: 'apparel',
    price: 43.85,
    originalPrice: 59.99,
    rating: 4.9,
    reviewCount: 128,
    badge: '3D Configurable',
    description: '100% Premium Organic Cotton with 3D live print preview canvas. Engineered for maximum comfort, durability, and high-definition custom graphic printing.',
    imageUrl: '/Capture21.PNG',
    galleryImages: [
      '/Capture21.PNG',
      '/Capture22.PNG',
      '/Capture23.PNG'
    ],
    colorSwatches: ['#ffffff', '#18181b', '#3f3f46', '#a1a1aa'],
    configuratorKey: 'apparel',
    tags: ['Streetwear', 'Cotton', 'Print'],
    features: [
      '100% Heavyweight Organic Cotton (240 GSM)',
      'Pre-shrunk fabric with reinforced double-needle stitching',
      'Full 3D WebGL real-time design customization',
      'Breathable, ultra-soft tactile feel'
    ],
    isDisabled: false
  },
  {
    id: 'apparel-cap',
    name: 'Urban Structured 6-Panel Cap',
    category: 'apparel',
    price: 34.50,
    originalPrice: 45.00,
    rating: 4.8,
    reviewCount: 94,
    badge: 'Coming Soon',
    description: 'Custom embroidered front panel with breathable eyelets and adjustable metallic snap closure.',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop'
    ],
    colorSwatches: ['#09090b', '#27272a', '#71717a'],
    configuratorKey: 'cap',
    tags: ['Headwear', 'Accessories', 'Custom'],
    isDisabled: true
  },
  {
    id: 'apparel-card',
    name: 'Luxury Velvet Finish Business Card',
    category: 'apparel',
    price: 19.99,
    rating: 4.9,
    reviewCount: 210,
    badge: 'Coming Soon',
    description: 'Soft-touch velvet coated card stock with customizable high-end metallic foil embossed layout.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop'
    ],
    colorSwatches: ['#1e1b4b', '#312e81', '#6366f1'],
    configuratorKey: 'businesscard',
    tags: ['Stationery', 'Branding', 'Print'],
    isDisabled: true
  },
  {
    id: 'apparel-hoodie',
    name: 'Cyberpunk Reflective Oversized Hoodie',
    category: 'apparel',
    price: 89.00,
    originalPrice: 110.00,
    rating: 4.9,
    reviewCount: 76,
    badge: 'Coming Soon',
    description: 'Heavy fleece lined dark hoodie with water-resistant coating, thumbhole cuffs, and high collar.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop'
    ],
    colorSwatches: ['#18181b', '#52525b', '#d4d4d8'],
    tags: ['Hoodie', 'Winter', 'Darkwear'],
    isDisabled: true
  },

  // FURNITURE CATEGORY
  {
    id: 'furn-chair-1',
    name: 'Nordic Velvet Armchair',
    category: 'furniture',
    price: 299.00,
    originalPrice: 380.00,
    rating: 4.9,
    reviewCount: 164,
    badge: 'Coming Soon',
    description: 'High-density foam cushion with matte black steel frame and luxury tactile velvet upholstery.',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop'
    ],
    colorSwatches: ['#2e3d34', '#586b5c', '#9fb3a3'],
    tags: ['Seating', 'Living Room', 'Velvet'],
    isDisabled: true
  },
  {
    id: 'furn-desk-1',
    name: 'Minimalist Natural Walnut Studio Desk',
    category: 'furniture',
    price: 449.00,
    originalPrice: 520.00,
    rating: 4.8,
    reviewCount: 88,
    badge: 'Coming Soon',
    description: 'Solid walnut timber desk with integrated wire routing channels and invisible drawer joints.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop'
    ],
    colorSwatches: ['#451a03', '#78350f', '#d97706'],
    tags: ['Office', 'Workspace', 'Wood'],
    isDisabled: true
  },
  {
    id: 'furn-table-1',
    name: 'Modern Ceramic Stone Coffee Table',
    category: 'furniture',
    price: 189.50,
    rating: 4.7,
    reviewCount: 43,
    badge: 'Coming Soon',
    description: 'Scratch-resistant slate ceramic stone tabletop supported by geometric aluminum legs.',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop'
    ],
    colorSwatches: ['#1f2937', '#4b5563', '#9ca3af'],
    tags: ['Tables', 'Ceramic', 'Modern'],
    isDisabled: true
  },
  {
    id: 'furn-lounge-1',
    name: 'Scandinavian Bouclé Curved Sofa',
    category: 'furniture',
    price: 699.00,
    originalPrice: 850.00,
    rating: 4.9,
    reviewCount: 31,
    badge: 'Coming Soon',
    description: 'Organic sculptural curve sofa wrapped in textured ivory bouclé wool fabric.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop'
    ],
    colorSwatches: ['#f3f4f6', '#d1d5db', '#6b7280'],
    tags: ['Sofa', 'Bouclé', 'Scandinavian'],
    isDisabled: true
  }
];
