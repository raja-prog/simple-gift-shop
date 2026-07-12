"use client";
import { useState, useEffect, Fragment } from "react";
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
  const [imageList, setImageList] = useState<string[]>([]); // gallery images
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  // Inline image manager state
  const [managingImagesProductId, setManagingImagesProductId] = useState<string | null>(null);
  const [manageImageList, setManageImageList] = useState<string[]>([]);
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
  function resetProductForm() { setProductForm({}); setEditingProductId(null); setImageList([]); }

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
      const imageRaw = productForm.image || imageList[0] || 'https://placehold.co/600x600';
    let cleanedImage = imageRaw;
    try {
      if (imageRaw.includes('google.com/imgres')) {
        const u = new URL(imageRaw);
        const original = u.searchParams.get('imgurl');
        if (original) cleanedImage = decodeURIComponent(original);
      }
    } catch { /* ignore parsing errors */ }
      const galleryImages: { url: string; order: number }[] = imageList
        .map((u, idx) => ({ url: u, order: idx }))
        .filter(it => it.url && it.url.trim().length > 0);
      const payload: { id?: string; name?: string; description?: string | null; image: string; price?: number; categoryId?: string; images?: { url: string; order: number }[] } = { id: productForm.id, name: productForm.name, description: productForm.description || null, image: cleanedImage, price: productForm.price, categoryId: selectedCategory };
      if (galleryImages.length > 0) payload.images = galleryImages;
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
  async function startEditProduct(p: Product) {
    setEditingProductId(p.id);
    setProductForm(p);
    setSelectedCategory(p.categoryId);
    // Auto-select mode based on existing image format
    setUseFileUpload(p.image.startsWith('data:'));
    // Load gallery images for this product
    try {
      const res = await fetch(`/api/products/${p.id}`);
      if (res.ok) {
  const full: { images?: Array<{ url: string }> } = await res.json();
  const urls = Array.isArray(full.images) ? full.images.map((it) => it.url).filter((u) => !!u) : [];
        setImageList(urls);
      }
    } catch {}
  }
  async function removeProduct(id: string) { if (!confirm("Delete product?")) return; const res = await fetch(`/api/products/${id}`, { method: 'DELETE' }); if (!res.ok) alert('Delete failed'); await loadAll(); }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProductForm(f => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function addImageField() { setImageList(list => [...list, '']); }
  function updateImageField(idx: number, value: string) { setImageList(list => list.map((u, i) => i === idx ? value : u)); }
  function removeImageField(idx: number) { setImageList(list => list.filter((_, i) => i !== idx)); }
  function dedupe(list: string[]) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of list) {
      const key = (u || '').trim();
      if (!key) continue;
      if (!seen.has(key)) { seen.add(key); out.push(key); }
    }
    return out;
  }
  // Inline image manager helpers
  async function startManageImages(p: Product) {
    setManagingImagesProductId(p.id);
    try {
      const res = await fetch(`/api/products/${p.id}`);
      if (res.ok) {
        const full: { images?: Array<{ url: string }> } = await res.json();
        const urls = Array.isArray(full.images) ? full.images.map((it) => it.url).filter((u) => !!u) : [];
        setManageImageList(urls);
      } else {
        setManageImageList([]);
      }
    } catch {
      setManageImageList([]);
    }
  }
  function closeManageImages() { setManagingImagesProductId(null); setManageImageList([]); }
  function addManageImageField() { setManageImageList(list => [...list, '']); }
  function updateManageImageField(idx: number, value: string) { setManageImageList(list => list.map((u, i) => i === idx ? value : u)); }
  function removeManageImageField(idx: number) { setManageImageList(list => list.filter((_, i) => i !== idx)); }
  function handleMultipleManageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const readers = files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = ev => resolve(String(ev.target?.result || ''));
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
      setManageImageList(list => dedupe([...list, ...results]));
    });
    e.currentTarget.value = '';
  }
  async function saveManageImages() {
    if (!managingImagesProductId) return;
    const galleryImages: { url: string; order: number }[] = manageImageList
      .map((u, idx) => ({ url: u, order: idx }))
      .filter(it => it.url && it.url.trim().length > 0);
    try {
      const res = await fetch(`/api/products/${managingImagesProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: galleryImages })
      });
      if (!res.ok) { alert('Saving images failed'); return; }
      await loadAll();
      closeManageImages();
    } catch {
      alert('Saving images failed');
    }
  }
  function handleMultipleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const readers = files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = ev => resolve(String(ev.target?.result || ''));
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
      setImageList(list => dedupe([...list, ...results]));
    });
    // clear input
    e.currentTarget.value = '';
  }
  function bulkAddFromText(text: string) {
    // Accept comma, space, or newline separated URLs
    const parts = text
      .split(/\s|,|;|\n|\r/)
      .map(s => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setImageList(list => dedupe([...list, ...parts]));
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto p-6 mt-10 gift-card gift-hover flex flex-col gap-4">
        <h1 className="h2-title gradient-text text-center">Admin Login</h1>
        <form onSubmit={authenticate} className="flex flex-col gap-3">
          <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Password" className="admin-input" />
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
      <section className={`gift-card gift-hover transition-opacity duration-300 ${showCategories ? 'px-5 py-5 opacity-100 overflow-visible' : 'px-5 py-0 opacity-0 max-h-0 overflow-hidden'} md:opacity-100 md:overflow-visible md:py-5`}>
        <h2 className="text-base font-semibold mb-4 text-high-contrast">Categories</h2>
        <form onSubmit={submitCategory} className="grid gap-4 grid-cols-1 sm:grid-cols-4 text-sm">
          <label className="admin-field">
            <span className="admin-label">ID <span className="text-pink-500">*</span></span>
            <input value={categoryForm.id || ''} onChange={e => setCategoryForm(f => ({ ...f, id: e.target.value }))} placeholder="e.g. frames" disabled={!!editingCategoryId} className="admin-input disabled:opacity-60" />
          </label>
          <label className="admin-field">
            <span className="admin-label">Name <span className="text-pink-500">*</span></span>
            <input value={categoryForm.name || ''} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Resin Frames" className="admin-input" />
          </label>
          <label className="admin-field sm:col-span-2">
            <span className="admin-label">Description</span>
            <textarea value={categoryForm.description || ''} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description (optional)" rows={2} className="admin-input" />
          </label>
          <div className="flex gap-2 col-span-full flex-wrap">
            <button className="gift-btn-primary px-5 py-3 text-sm flex-1 sm:flex-none">{editingCategoryId ? 'Update category' : 'Add category'}</button>
            {editingCategoryId && <button type="button" onClick={resetCategoryForm} className="gift-btn-outline px-5 py-3 text-sm">Cancel</button>}
          </div>
        </form>
        <ul className="mt-4 divide-y divide-[var(--gift-border)]">
          {categories.map(c => (
            <li key={c.id} className="py-3 flex justify-between items-center gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-high-contrast">{c.name}</span>
                <span className="text-[11px] md:text-xs text-subtle">{c.id}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEditCategory(c)} className="gift-btn-outline text-sm px-4 py-2">Edit</button>
                <button onClick={() => removeCategory(c.id)} className="gift-btn-primary text-sm px-4 py-2">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Products Section */}
      <section className={`gift-card gift-hover transition-opacity duration-300 ${showProducts ? 'px-5 py-5 opacity-100 overflow-visible' : 'px-5 py-0 opacity-0 max-h-0 overflow-hidden'} md:opacity-100 md:overflow-visible md:py-5`}>
        <h2 className="text-base font-semibold mb-4 text-high-contrast">Products</h2>
        <form onSubmit={submitProduct} className="grid gap-4 text-sm grid-cols-1 sm:grid-cols-6">
          <label className="admin-field sm:col-span-2">
            <span className="admin-label">ID <span className="text-pink-500">*</span></span>
            <input value={productForm.id || ''} onChange={e => setProductForm(f => ({ ...f, id: e.target.value }))} placeholder="e.g. resin-frame-01" disabled={!!editingProductId} className="admin-input disabled:opacity-60" />
          </label>
          <label className="admin-field sm:col-span-2">
            <span className="admin-label">Name <span className="text-pink-500">*</span></span>
            <input value={productForm.name || ''} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Couple Resin Frame" className="admin-input" />
          </label>
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
              <input value={productForm.image || ''} onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))} placeholder="Primary Image URL" className="admin-input" />
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
          <label className="admin-field sm:col-span-3">
            <span className="admin-label">Price <span className="text-pink-500">*</span></span>
            <input value={productForm.price?.toString() || ''} onChange={e => setProductForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="e.g. 499" type="number" step="0.01" className="admin-input" />
          </label>
          <label className="admin-field sm:col-span-3">
            <span className="admin-label">Category <span className="text-pink-500">*</span></span>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="admin-input">
              <option value=''>Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="admin-field col-span-full">
            <span className="admin-label">Description</span>
            <textarea value={productForm.description || ''} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the product (optional)" rows={3} className="admin-input" />
          </label>
          {/* Gallery images */}
          <div className="col-span-full flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-medium text-subtle">Gallery Images (optional)</span>
              <button type="button" onClick={addImageField} className="gift-btn-outline px-3 py-1 text-xs">Add URL</button>
            </div>
            <div className="flex flex-col gap-2">
              {imageList.map((u, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input value={u} onChange={e => updateImageField(idx, e.target.value)} placeholder={`Image URL #${idx+1}`} className="admin-input flex-1" />
                  <button type="button" onClick={() => removeImageField(idx)} className="gift-btn-outline px-2 py-2 text-xs">Remove</button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs md:text-sm text-subtle">Or upload multiple</label>
              <input type="file" accept="image/*" multiple onChange={handleMultipleFiles} className="text-xs md:text-sm" />
            </div>
            {/* Bulk paste helper */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs md:text-sm text-subtle">Paste multiple URLs (comma, space, or newline separated)</label>
              <div className="flex items-center gap-2">
                <textarea rows={2} placeholder="https://...\nhttps://..." className="flex-1 rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" id="bulkUrls"></textarea>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('bulkUrls') as HTMLTextAreaElement | null;
                    bulkAddFromText(el?.value || '');
                    if (el) el.value = '';
                  }}
                  className="gift-btn-outline px-3 py-2 text-xs"
                >Add</button>
              </div>
            </div>
            {/* Preview thumbnails */}
            {imageList.length > 0 && (
              <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {imageList.map((u, idx) => (
                  <div key={`thumb-${idx}`} className="relative w-full pt-[100%] border border-[var(--gift-border)] rounded overflow-hidden">
                    <Image src={u} alt={`Gallery ${idx+1}`} fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 col-span-full flex-wrap">
            <button className="gift-btn-primary px-5 py-3 text-sm flex-1 sm:flex-none">{editingProductId ? 'Update product' : 'Add product'}</button>
            {editingProductId && <button type="button" onClick={resetProductForm} className="gift-btn-outline px-5 py-3 text-sm">Cancel</button>}
          </div>
        </form>
        <ul className="mt-4 divide-y divide-[var(--gift-border)]">
          {products.map(p => (
            <Fragment key={p.id}>
              <li className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-[var(--gift-border)] bg-[var(--gift-bg-alt)]">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-subtle">No image</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-high-contrast truncate">{p.name}</span>
                    <span className="text-[11px] md:text-xs text-subtle truncate">{p.id}</span>
                    <span className="text-[11px] md:text-xs text-subtle truncate">{p.categoryId}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEditProduct(p)} className="gift-btn-outline text-sm px-4 py-2 flex-1 sm:flex-none">Edit</button>
                  <button onClick={() => startManageImages(p)} className="gift-btn-outline text-sm px-4 py-2 flex-1 sm:flex-none">Images</button>
                  <button onClick={() => removeProduct(p.id)} className="gift-btn-primary text-sm px-4 py-2 flex-1 sm:flex-none">Delete</button>
                </div>
              </li>
              {managingImagesProductId === p.id && (
                <li className="py-3 text-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-subtle">Manage Images for {p.name}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={saveManageImages} className="gift-btn-primary px-3 py-1 text-xs">Save</button>
                        <button type="button" onClick={closeManageImages} className="gift-btn-outline px-3 py-1 text-xs">Close</button>
                      </div>
                    </div>
                    {/* Fields */}
                    <div className="flex flex-col gap-2">
                      {manageImageList.map((u, idx) => (
                        <div key={`m-${idx}`} className="flex items-center gap-2">
                          <input value={u} onChange={e => updateManageImageField(idx, e.target.value)} placeholder={`Image URL #${idx+1}`} className="admin-input flex-1" />
                          <button type="button" onClick={() => removeManageImageField(idx)} className="gift-btn-outline px-2 py-2 text-xs">Remove</button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={addManageImageField} className="gift-btn-outline px-3 py-1 text-xs">Add URL</button>
                        <label className="text-xs md:text-sm text-subtle">Or upload multiple</label>
                        <input type="file" accept="image/*" multiple onChange={handleMultipleManageFiles} className="text-xs md:text-sm" />
                      </div>
                    </div>
                    {/* Preview */}
                    {manageImageList.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {manageImageList.map((u, idx) => (
                          <div key={`m-thumb-${idx}`} className="relative w-full pt-[100%] border border-[var(--gift-border)] rounded overflow-hidden">
                            <Image src={u} alt={`Gallery ${idx+1}`} fill sizes="120px" className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              )}
            </Fragment>
          ))}
        </ul>
      </section>
    </div>
  );
}
