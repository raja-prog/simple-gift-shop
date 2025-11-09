export type Product = {
  id: string;
  name: string;
  description: string;
  image: string; // URL for now
  price: number;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type StoreData = {
  categories: Category[];
  products: Product[];
};

// Example initial data (MVP local in-memory / JSON simulation)
export const store: StoreData = {
  categories: [
    { id: "candles", name: "Handmade Candles", description: "Scented artisan candles" },
    { id: "cards", name: "Greeting Cards", description: "Unique printed cards" },
    { id: "gifts", name: "Gift Sets", description: "Curated gift bundles" }
  ],
  products: [
    {
      id: "candle-rose-001",
      name: "Rose Petal Candle",
      description: "Soy wax candle with natural rose fragrance.",
      image: "https://images.unsplash.com/photo-1600374297150-7aa31d1d194f?w=640&auto=format&fit=crop",
      price: 12.5,
      categoryId: "candles"
    },
    {
      id: "card-birthday-001",
      name: "Birthday Balloon Card",
      description: "Matte finish card with colorful balloons.",
      image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=640&auto=format&fit=crop",
      price: 4.0,
      categoryId: "cards"
    },
    {
      id: "gift-set-relax-001",
      name: "Relaxation Gift Set",
      description: "Includes candle, tea sampler, and mini journal.",
      image: "https://images.unsplash.com/photo-1526079133253-96c3c70c3a56?w=640&auto=format&fit=crop",
      price: 34.99,
      categoryId: "gifts"
    }
  ]
};

// Simple in-memory mutation functions (not persisted across server restarts)
export function addCategory(category: Category) {
  store.categories.push(category);
}

export function updateCategory(id: string, data: Partial<Category>) {
  const c = store.categories.find(c => c.id === id);
  if (c) Object.assign(c, data);
}

export function deleteCategory(id: string) {
  store.categories = store.categories.filter(c => c.id !== id);
  store.products = store.products.filter(p => p.categoryId !== id);
}

export function addProduct(product: Product) {
  store.products.push(product);
}

export function updateProduct(id: string, data: Partial<Product>) {
  const p = store.products.find(p => p.id === id);
  if (p) Object.assign(p, data);
}

export function deleteProduct(id: string) {
  store.products = store.products.filter(p => p.id !== id);
}
