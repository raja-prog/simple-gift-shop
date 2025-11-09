"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "kundima123"; // MVP front-end only

interface Category { id: string; name: string; description?: string | null; }
interface Product { id: string; name: string; description?: string | null; image: string; price: number; categoryId: string; }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({});
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  // Mobile UX state
  const [showCategories, setShowCategories] = useState(true);
  const [showProducts, setShowProducts] = useState(true);

  async function loadAll() {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products')
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  function authenticate(e: React.FormEvent) { e.preventDefault(); if (pw === ADMIN_PASSWORD) setAuthed(true); else alert("Incorrect password"); }
  function resetCategoryForm() { setCategoryForm({}); setEditingCategoryId(null); }
  function resetProductForm() { setProductForm({}); setEditingProductId(null); }

  async function submitCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.id) { alert("Category needs id & name"); return; }
    if (editingCategoryId) {
      const res = await fetch(`/api/categories/${editingCategoryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: categoryForm.name, description: categoryForm.description }) });
      if (!res.ok) alert('Update failed');
    } else {
      if (categories.some(c => c.id === categoryForm.id)) { alert("ID already exists"); return; }
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: categoryForm.id, name: categoryForm.name, description: categoryForm.description }) });
      if (!res.ok) alert('Create failed');
    }
    await loadAll();
    resetCategoryForm();
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!productForm.name || !productForm.id || !selectedCategory || productForm.price === undefined) { alert("Product needs id, name, price, category"); return; }
    // Clean potential google redirect image before persisting
    const imageRaw = productForm.image || 'https://placehold.co/600x600';
    let cleanedImage = imageRaw;
    try {
      if (imageRaw.includes('google.com/imgres')) {
        const u = new URL(imageRaw);
        const original = u.searchParams.get('imgurl');
        if (original) cleanedImage = decodeURIComponent(original);
      }
    } catch { /* ignore parsing errors */ }
    const payload = { id: productForm.id, name: productForm.name, description: productForm.description, image: cleanedImage, price: productForm.price, categoryId: selectedCategory };
    if (editingProductId) {
      const res = await fetch(`/api/products/${editingProductId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) alert('Update failed');
    } else {
      if (products.some(p => p.id === productForm.id)) { alert("ID already exists"); return; }
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) alert('Create failed');
    }
    await loadAll();
    resetProductForm();
  }

  function startEditCategory(c: Category) { setEditingCategoryId(c.id); setCategoryForm(c); }
  async function removeCategory(id: string) { if (!confirm("Delete category and its products?")) return; const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' }); if (!res.ok) alert('Delete failed'); await loadAll(); }
  function startEditProduct(p: Product) {
    setEditingProductId(p.id);
    setProductForm(p);
    setSelectedCategory(p.categoryId);
    // Auto-select mode based on existing image format
    setUseFileUpload(p.image.startsWith('data:'));
  }
  async function removeProduct(id: string) { if (!confirm("Delete product?")) return; const res = await fetch(`/api/products/${id}`, { method: 'DELETE' }); if (!res.ok) alert('Delete failed'); await loadAll(); }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProductForm(f => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto p-6 mt-10 gift-card gift-hover flex flex-col gap-4">
        <h1 className="h2-title gradient-text text-center">Admin Login</h1>
        <form onSubmit={authenticate} className="flex flex-col gap-3">
          <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Password" className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <button className="gift-btn-primary w-full py-3 text-sm">Enter</button>
        </form>
  <p className="text-xs md:text-sm text-subtle text-center">MVP front-end only password check. Do not use for production.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Sticky mobile header */}
      <div className="sticky top-0 z-20 bg-[var(--gift-bg)]/90 backdrop-blur-sm border-b border-[var(--gift-border)] py-3 mb-2 flex flex-col gap-2 md:static md:bg-transparent md:backdrop-blur-none md:border-none">
        <div className="flex items-center justify-between">
          <h1 className="h2-title gradient-text text-base md:text-2xl">Admin Panel</h1>
          <div className="flex gap-2 md:hidden">
            <button onClick={() => setShowCategories(s => !s)} aria-expanded={showCategories} className="gift-btn-outline px-4 py-2 text-xs md:text-sm">{showCategories ? 'Hide' : 'Show'} Categories</button>
            <button onClick={() => setShowProducts(s => !s)} aria-expanded={showProducts} className="gift-btn-outline px-4 py-2 text-xs md:text-sm">{showProducts ? 'Hide' : 'Show'} Products</button>
          </div>
        </div>
  {loading && <p className="text-xs md:text-sm text-subtle">Syncing…</p>}
      </div>

      {/* Categories Section */}
      <section className={`gift-card gift-hover transition-[max-height,opacity] duration-300 overflow-hidden ${showCategories ? 'px-5 py-5 opacity-100 max-h-[2000px]' : 'px-5 py-0 opacity-0 max-h-0'} md:opacity-100 md:max-h-none md:py-5`}>
        <h2 className="text-base font-semibold mb-4 text-high-contrast">Categories</h2>
        <form onSubmit={submitCategory} className="grid gap-3 grid-cols-1 sm:grid-cols-4 text-sm">
          <input value={categoryForm.id || ''} onChange={e => setCategoryForm(f => ({ ...f, id: e.target.value }))} placeholder="ID" className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <input value={categoryForm.name || ''} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <textarea value={categoryForm.description || ''} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 sm:col-span-1 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <div className="flex gap-2 col-span-full flex-wrap">
            <button className="gift-btn-primary px-5 py-3 text-xs md:text-sm">{editingCategoryId ? 'Update' : 'Add'}</button>
            {editingCategoryId && <button type="button" onClick={resetCategoryForm} className="gift-btn-outline px-5 py-3 text-xs md:text-sm">Cancel</button>}
          </div>
        </form>
        <ul className="mt-4 divide-y divide-[var(--gift-border)]">
          {categories.map(c => (
            <li key={c.id} className="py-3 flex justify-between items-center gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-high-contrast">{c.name}</span>
                <span className="text-[11px] md:text-xs text-subtle">{c.id}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEditCategory(c)} className="gift-btn-outline text-xs md:text-sm px-3 py-1">Edit</button>
                <button onClick={() => removeCategory(c.id)} className="gift-btn-primary text-xs md:text-sm px-3 py-1">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Products Section */}
      <section className={`gift-card gift-hover transition-[max-height,opacity] duration-300 overflow-hidden ${showProducts ? 'px-5 py-5 opacity-100 max-h-[3000px]' : 'px-5 py-0 opacity-0 max-h-0'} md:opacity-100 md:max-h-none md:py-5`}>
        <h2 className="text-base font-semibold mb-4 text-high-contrast">Products</h2>
        <form onSubmit={submitProduct} className="grid gap-3 text-sm grid-cols-1 sm:grid-cols-6">
          <input value={productForm.id || ''} onChange={e => setProductForm(f => ({ ...f, id: e.target.value }))} placeholder="ID" className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <input value={productForm.name || ''} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
            <fieldset className="flex flex-col gap-2">
              <legend className="text-xs md:text-sm font-medium text-subtle">Image Source</legend>
              <div className="flex items-center gap-2">
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs md:text-sm font-medium transition-colors cursor-pointer select-none ${!useFileUpload ? 'bg-[var(--gift-accent)] text-white border-[var(--gift-accent)] shadow-sm' : 'bg-[var(--gift-bg-alt)] text-high-contrast border-[var(--gift-border)] hover:bg-pink-100'}`}
                >
                  <input
                    type="radio"
                    name="imgMode"
                    className="sr-only"
                    checked={!useFileUpload}
                    onChange={() => {
                      setUseFileUpload(false);
                      // Clear data URL when switching back to URL mode
                      setProductForm(f => f.image && f.image.startsWith('data:') ? { ...f, image: '' } : f);
                    }}
                    aria-label="Use an image URL"
                  />
                  URL
                </label>
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs md:text-sm font-medium transition-colors cursor-pointer select-none ${useFileUpload ? 'bg-[var(--gift-accent)] text-white border-[var(--gift-accent)] shadow-sm' : 'bg-[var(--gift-bg-alt)] text-high-contrast border-[var(--gift-border)] hover:bg-pink-100'}`}
                >
                  <input
                    type="radio"
                    name="imgMode"
                    className="sr-only"
                    checked={useFileUpload}
                    onChange={() => {
                      setUseFileUpload(true);
                      // Clear remote URL when switching to upload mode
                      setProductForm(f => f.image && /^https?:\/\//.test(f.image) ? { ...f, image: '' } : f);
                    }}
                    aria-label="Upload an image file"
                  />
                  Upload
                </label>
              </div>
            </fieldset>
            {!useFileUpload && (
              <input value={productForm.image || ''} onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL" className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
            )}
            {useFileUpload && (
              <div className="flex flex-col gap-2">
                <label className="flex flex-col gap-2 text-xs md:text-sm text-subtle">
                  <span>Choose file</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="text-xs md:text-sm" />
                </label>
                {productForm.image && productForm.image.startsWith('data:') && (
                  <div className="relative w-20 h-20">
                    <Image src={productForm.image} alt="Preview" fill sizes="80px" className="object-cover rounded border border-[var(--gift-border)]" />
                  </div>
                )}
              </div>
            )}
          </div>
          <input value={productForm.price?.toString() || ''} onChange={e => setProductForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="Price" type="number" step="0.01" className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast">
            <option value=''>Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea value={productForm.description || ''} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className="rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-3 col-span-full focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
          <div className="flex gap-2 col-span-full flex-wrap">
            <button className="gift-btn-primary px-5 py-3 text-xs md:text-sm">{editingProductId ? 'Update' : 'Add'}</button>
            {editingProductId && <button type="button" onClick={resetProductForm} className="gift-btn-outline px-5 py-3 text-xs md:text-sm">Cancel</button>}
          </div>
        </form>
        <ul className="mt-4 divide-y divide-[var(--gift-border)]">
          {products.map(p => (
            <li key={p.id} className="py-3 flex justify-between items-center gap-4 text-sm">
              <div className="flex flex-col max-w-[50%]">
                <span className="font-medium text-high-contrast truncate">{p.name}</span>
                <span className="text-[11px] md:text-xs text-subtle truncate">{p.id}</span>
                <span className="text-[11px] md:text-xs text-subtle truncate">{p.categoryId}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEditProduct(p)} className="gift-btn-outline text-xs md:text-sm px-3 py-1">Edit</button>
                <button onClick={() => removeProduct(p.id)} className="gift-btn-primary text-xs md:text-sm px-3 py-1">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
