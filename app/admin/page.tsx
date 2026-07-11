"use client";
import { useState, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
import { compressImageFile } from "@/lib/image";

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
  // Revamp UX state
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  useEffect(() => { setMounted(true); }, []);
  // Check for an existing admin session on mount (httpOnly cookie, server-verified)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/session');
        if (active && res.ok) {
          const data = await res.json();
          setAuthed(!!data.authed);
        }
      } finally {
        if (active) setAuthChecking(false);
      }
    })();
    return () => { active = false; };
  }, []);
  function toggleGroup(id: string) { setCollapsedGroups(g => ({ ...g, [id]: !g[id] })); }
  // Combined preview images: primary first, then gallery (deduped, non-empty)
  function previewImages() {
    const all = [productForm.image || '', ...imageList].map(u => (u || '').trim()).filter(Boolean);
    const seen = new Set<string>();
    return all.filter(u => (seen.has(u) ? false : (seen.add(u), true)));
  }
  function isValidImage(u: string) { return !!u && (u.startsWith('data:image') || /^https?:\/\//.test(u)); }

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

  async function authenticate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        setAuthed(true);
        setPw("");
      } else if (res.status === 429) {
        alert("Too many attempts. Please wait a minute and try again.");
      } else {
        alert("Incorrect password");
      }
    } catch {
      alert("Login failed. Please try again.");
    }
  }
  async function logout() {
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {}
    setAuthed(false);
    setPw("");
  }
  function categoryName(id: string) { return categories.find(c => c.id === id)?.name || id; }
  function renderProductRow(p: Product) {
    return (
      <Fragment key={p.id}>
        <li className="py-3 flex justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-3 min-w-0">
            {p.image && (p.image.startsWith('data:') || /^https?:\/\//.test(p.image)) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover border border-[var(--gift-border)] shrink-0" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-[var(--gift-bg-alt)] border border-[var(--gift-border)] shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-high-contrast truncate">{p.name}</span>
              <span className="text-[11px] md:text-xs text-subtle truncate">{categoryName(p.categoryId)} · ₹{p.price}</span>
              <span className="text-[11px] text-subtle/70 truncate">{p.id}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => startEditProduct(p)} className="gift-btn-outline text-xs md:text-sm px-3 py-1">Edit</button>
            <button onClick={() => startManageImages(p)} className="gift-btn-outline text-xs md:text-sm px-3 py-1">Images</button>
            <button onClick={() => removeProduct(p.id)} className="gift-btn-primary text-xs md:text-sm px-3 py-1">Delete</button>
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
              <div className="flex flex-col gap-2">
                {manageImageList.map((u, idx) => (
                  <div key={`m-${idx}`} className="flex items-center gap-2">
                    <input value={u} onChange={e => updateManageImageField(idx, e.target.value)} placeholder={`Image URL #${idx+1}`} className="flex-1 rounded border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
                    <button type="button" onClick={() => removeManageImageField(idx)} className="gift-btn-outline px-2 py-2 text-xs">Remove</button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={addManageImageField} className="gift-btn-outline px-3 py-1 text-xs">Add URL</button>
                  <label className="text-xs md:text-sm text-subtle">Or upload multiple</label>
                  <input type="file" accept="image/*" multiple onChange={handleMultipleManageFiles} className="text-xs md:text-sm" />
                </div>
              </div>
              {manageImageList.length > 0 && (
                <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {manageImageList.map((u, idx) => (
                    <div key={`m-thumb-${idx}`} className="relative w-full pt-[100%] border border-[var(--gift-border)] rounded overflow-hidden bg-[var(--gift-bg-alt)]">
                      {isValidImage(u) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u} alt={`Gallery ${idx+1}`} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-subtle">invalid</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        )}
      </Fragment>
    );
  }
  function resetCategoryForm() { setCategoryForm({}); setEditingCategoryId(null); }
  function resetProductForm() { setProductForm({}); setEditingProductId(null); setImageList([]); setPreviewIndex(0); }
  function openNewProduct() { resetProductForm(); setSelectedCategory(''); setUseFileUpload(false); setActiveTab('products'); setProductDrawerOpen(true); }
  function closeProductDrawer() { setProductDrawerOpen(false); resetProductForm(); }

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
    setProductDrawerOpen(false);
  }

  function startEditCategory(c: Category) { setActiveTab('categories'); setEditingCategoryId(c.id); setCategoryForm(c); }
  async function removeCategory(id: string) { if (!confirm("Delete category and its products?")) return; const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' }); if (!res.ok) alert('Delete failed'); await loadAll(); }
  async function startEditProduct(p: Product) {
    setActiveTab('products');
    setProductDrawerOpen(true);
    setPreviewIndex(0);
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

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    setProductForm(f => ({ ...f, image: compressed }));
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
  async function handleMultipleManageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const results = await Promise.all(files.map(f => compressImageFile(f)));
    setManageImageList(list => dedupe([...list, ...results]));
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
  async function handleMultipleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const results = await Promise.all(files.map(f => compressImageFile(f)));
    setImageList(list => dedupe([...list, ...results]));
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
      <div className="page-shell flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-sm gift-card px-7 py-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="h2-title text-high-contrast">Admin</h1>
            <p className="text-xs text-subtle">Sign in to manage your store</p>
          </div>
          <form onSubmit={authenticate} className="flex flex-col gap-3">
            <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Password" className="rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
            <button disabled={authChecking} className="gift-btn-primary w-full py-3 text-sm disabled:opacity-60">
              {authChecking ? "Checking…" : "Enter"}
            </button>
          </form>
          <p className="text-[11px] text-subtle text-center">Secure server-side session &mdash; only you can manage the store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex flex-col gap-6">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-5 md:mx-0 px-5 md:px-0 bg-[var(--gift-bg)]/85 backdrop-blur-md border-b border-[var(--gift-border)] py-4 md:static md:bg-transparent md:backdrop-blur-none md:border-none flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="h2-title text-high-contrast">Admin Panel</h1>
          {loading && <span className="text-xs text-subtle animate-pulse">Syncing…</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="gift-btn-outline px-4 py-2 text-xs">Refresh</button>
          <button onClick={logout} className="gift-btn-outline px-4 py-2 text-xs">Log out</button>
        </div>
      </div>

      {/* Stats + Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] p-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-[var(--gift-accent)] text-white shadow-sm' : 'text-subtle hover:text-high-contrast'}`}
          >
            Products <span className="opacity-70">({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-[var(--gift-accent)] text-white shadow-sm' : 'text-subtle hover:text-high-contrast'}`}
          >
            Categories <span className="opacity-70">({categories.length})</span>
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <section className={`${activeTab === 'categories' ? 'block' : 'hidden'} gift-card px-5 py-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="card-title-serif text-xl text-high-contrast">Categories</h2>
          <input
            value={categorySearch}
            onChange={e => setCategorySearch(e.target.value)}
            placeholder="Search categories…"
            className="rounded-full border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle"
          />
        </div>
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
          {categories
            .filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()) || c.id.toLowerCase().includes(categorySearch.toLowerCase()))
            .map(c => (
            <li key={c.id} className="py-3 flex justify-between items-center gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-high-contrast">{c.name}</span>
                <span className="text-[11px] md:text-xs text-subtle">{c.id} · {products.filter(p => p.categoryId === c.id).length} products</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEditCategory(c)} className="gift-btn-outline text-xs md:text-sm px-3 py-1">Edit</button>
                <button onClick={() => removeCategory(c.id)} className="gift-btn-primary text-xs md:text-sm px-3 py-1">Delete</button>
              </div>
            </li>
          ))}
          {categories.length === 0 && <li className="py-6 text-center text-sm text-subtle italic">No categories yet.</li>}
        </ul>
      </section>

      {/* Products Section */}
      <section className={`${activeTab === 'products' ? 'block' : 'hidden'} gift-card px-5 py-5`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="card-title-serif text-xl text-high-contrast">Products</h2>
          <button type="button" onClick={openNewProduct} className="gift-btn-primary px-4 py-2 text-xs md:text-sm">+ New product</button>
        </div>

        {/* Slide-over product drawer */}
        {productDrawerOpen && mounted && createPortal((
          <div className="fixed inset-0 z-[100] flex">
            <button aria-label="Close" onClick={closeProductDrawer} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative ml-auto h-full w-full max-w-xl bg-[var(--gift-bg)] shadow-2xl overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--gift-border)] bg-[var(--gift-bg)]/95 backdrop-blur">
                <h3 className="card-title-serif text-lg text-high-contrast">{editingProductId ? 'Edit product' : 'New product'}</h3>
                <button type="button" onClick={closeProductDrawer} className="gift-btn-outline px-3 py-1.5 text-xs">Close</button>
              </div>

              {/* Live image slider preview */}
              {(() => {
                const imgs = previewImages();
                const idx = Math.min(previewIndex, Math.max(0, imgs.length - 1));
                const current = imgs[idx];
                return (
                  <div className="px-5 pt-5">
                    <div className="relative w-full aspect-square rounded-2xl border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] overflow-hidden">
                      {current && isValidImage(current) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={current} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-subtle">No image yet</div>
                      )}
                      {imgs.length > 1 && (
                        <>
                          <button type="button" onClick={() => setPreviewIndex((idx - 1 + imgs.length) % imgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white">‹</button>
                          <button type="button" onClick={() => setPreviewIndex((idx + 1) % imgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white">›</button>
                          {idx === 0 && <span className="absolute top-2 left-2 text-[10px] font-medium uppercase tracking-wide bg-[var(--gift-accent)] text-white rounded-full px-2 py-0.5">Primary</span>}
                        </>
                      )}
                    </div>
                    {imgs.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {imgs.map((u, i) => (
                          <button key={`pv-${i}`} type="button" onClick={() => setPreviewIndex(i)} className={`relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === idx ? 'border-[var(--gift-accent)]' : 'border-transparent'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u} alt={`thumb ${i+1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

        <form onSubmit={submitProduct} className="flex flex-col gap-5 px-5 py-5 text-sm">
          {/* Basic details */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-subtle uppercase tracking-wide">Product ID</span>
                <input value={productForm.id || ''} disabled={!!editingProductId} onChange={e => setProductForm(f => ({ ...f, id: e.target.value }))} placeholder="e.g. F-004" className="rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle disabled:opacity-60" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-subtle uppercase tracking-wide">Name</span>
                <input value={productForm.name || ''} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" className="rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-subtle uppercase tracking-wide">Price (₹)</span>
                <input value={productForm.price?.toString() || ''} onChange={e => setProductForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="0.00" type="number" step="0.01" className="rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-subtle uppercase tracking-wide">Category</span>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast">
                  <option value=''>Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-subtle uppercase tracking-wide">Description</span>
              <textarea value={productForm.description || ''} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the product…" rows={5} className="rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle resize-y" />
            </label>
          </div>

          {/* Primary image */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-[var(--gift-border)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-subtle uppercase tracking-wide">Primary image</span>
              <div className="inline-flex rounded-full border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] p-0.5">
                <button type="button" onClick={() => { setUseFileUpload(false); setProductForm(f => f.image && f.image.startsWith('data:') ? { ...f, image: '' } : f); }} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!useFileUpload ? 'bg-[var(--gift-accent)] text-white' : 'text-subtle hover:text-high-contrast'}`}>URL</button>
                <button type="button" onClick={() => { setUseFileUpload(true); setProductForm(f => f.image && /^https?:\/\//.test(f.image) ? { ...f, image: '' } : f); }} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${useFileUpload ? 'bg-[var(--gift-accent)] text-white' : 'text-subtle hover:text-high-contrast'}`}>Upload</button>
              </div>
            </div>
            {!useFileUpload ? (
              <input value={productForm.image || ''} onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))} placeholder="https://… image URL" className="rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
            ) : (
              <input type="file" accept="image/*" onChange={handleImageFile} className="text-xs md:text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--gift-accent)] file:text-white file:px-4 file:py-2 file:text-xs file:font-medium" />
            )}
          </div>

          {/* Gallery images */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--gift-border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-subtle uppercase tracking-wide">Gallery images <span className="normal-case opacity-70">(optional)</span></span>
              <button type="button" onClick={addImageField} className="gift-btn-outline px-3 py-1 text-xs">+ Add URL</button>
            </div>
            {imageList.length > 0 && (
              <div className="flex flex-col gap-2">
                {imageList.map((u, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input value={u} onChange={e => updateImageField(idx, e.target.value)} placeholder={`Image URL #${idx+1}`} className="flex-1 rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" />
                    <button type="button" onClick={() => removeImageField(idx)} className="gift-btn-outline px-3 py-2 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-subtle">Upload multiple files</span>
              <input type="file" accept="image/*" multiple onChange={handleMultipleFiles} className="text-xs md:text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--gift-bg-alt)] file:border file:border-[var(--gift-border)] file:px-4 file:py-2 file:text-xs" />
            </label>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-subtle">Paste multiple URLs (comma, space, or newline separated)</label>
              <div className="flex items-start gap-2">
                <textarea rows={2} placeholder="https://example.com/a.jpg, https://example.com/b.jpg" className="flex-1 rounded-lg border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle" id="bulkUrls"></textarea>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('bulkUrls') as HTMLTextAreaElement | null;
                    bulkAddFromText(el?.value || '');
                    if (el) el.value = '';
                  }}
                  className="gift-btn-outline px-4 py-2 text-xs shrink-0"
                >Add</button>
              </div>
            </div>
            {imageList.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {imageList.map((u, idx) => (
                  <div key={`thumb-${idx}`} className="relative w-full pt-[100%] border border-[var(--gift-border)] rounded-lg overflow-hidden bg-[var(--gift-bg-alt)]">
                    {isValidImage(u) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u} alt={`Gallery ${idx+1}`} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] text-subtle">invalid</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-[var(--gift-border)] sticky bottom-0 bg-[var(--gift-bg)] -mx-5 px-5 py-4">
            <button className="gift-btn-primary flex-1 px-5 py-3 text-sm">{editingProductId ? 'Update product' : 'Add product'}</button>
            <button type="button" onClick={closeProductDrawer} className="gift-btn-outline px-5 py-3 text-sm">Cancel</button>
          </div>
        </form>
            </div>
          </div>
        ), document.body)}
        <div className="mt-6 mb-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.15em] text-subtle">All products</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setGroupByCategory(g => !g)}
              className={`px-3 py-2 rounded-full border text-xs font-medium transition-colors ${groupByCategory ? 'bg-[var(--gift-accent)] text-white border-[var(--gift-accent)]' : 'bg-[var(--gift-bg-alt)] text-subtle border-[var(--gift-border)] hover:text-high-contrast'}`}
            >
              Group by category
            </button>
            <input
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 sm:flex-none rounded-full border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] px-4 py-2 text-sm sm:w-64 focus:outline-none focus:ring-2 focus:ring-pink-300 text-high-contrast placeholder:text-subtle"
            />
          </div>
        </div>

        {(() => {
          const filtered = products.filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.id.toLowerCase().includes(productSearch.toLowerCase()) || categoryName(p.categoryId).toLowerCase().includes(productSearch.toLowerCase()));
          if (filtered.length === 0) {
            return <p className="py-6 text-center text-sm text-subtle italic">{products.length === 0 ? 'No products yet.' : 'No products match your search.'}</p>;
          }
          if (!groupByCategory) {
            return <ul className="mt-2 divide-y divide-[var(--gift-border)]">{filtered.map(renderProductRow)}</ul>;
          }
          // Group by category, plus an "Uncategorized" bucket
          const groups = categories.map(c => ({ id: c.id, name: c.name, items: filtered.filter(p => p.categoryId === c.id) }));
          const orphanItems = filtered.filter(p => !categories.some(c => c.id === p.categoryId));
          if (orphanItems.length) groups.push({ id: '__uncategorized', name: 'Uncategorized', items: orphanItems });
          const visibleGroups = groups.filter(g => g.items.length > 0);
          return (
            <div className="mt-2 flex flex-col gap-3">
              {visibleGroups.map(g => {
                const collapsed = collapsedGroups[g.id];
                return (
                  <div key={g.id} className="rounded-xl border border-[var(--gift-border)] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleGroup(g.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[var(--gift-bg-alt)] hover:bg-pink-50 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`inline-block transition-transform text-subtle ${collapsed ? '' : 'rotate-90'}`}>▸</span>
                        <span className="font-medium text-high-contrast">{g.name}</span>
                      </span>
                      <span className="text-xs text-subtle bg-[var(--gift-bg)] border border-[var(--gift-border)] rounded-full px-2.5 py-0.5">{g.items.length}</span>
                    </button>
                    {!collapsed && (
                      <ul className="divide-y divide-[var(--gift-border)] px-4">
                        {g.items.map(renderProductRow)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
