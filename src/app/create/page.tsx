'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Sparkles, Upload, Tag, DollarSign, AlignLeft, Hash } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

const CATEGORIES = ['Streetwear','Luxury','Sneakers','Native Wear','Hoodies','Women','Accessories','Bags','Jewelry','Watches'];

export default function CreatePostPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_price: '',
    category: '', sizes: [] as string[], colors: [] as string[],
    stock: '10', tags: [] as string[], condition: 'new',
  });
  const [tagInput, setTagInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  const SIZES = ['XS','S','M','L','XL','XXL','XXXL','36','37','38','39','40','41','42','43','44','45','One Size'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files.slice(0, 6 - images.length)) {
      if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); continue; }
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'products');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) setImages(prev => [...prev, data.url]);
        else {
          // Fallback: use object URL for preview
          const url = URL.createObjectURL(file);
          setImages(prev => [...prev, url]);
          toast('Image preview only — add Cloudinary for permanent storage', { icon: '⚠️' });
        }
      } catch { toast.error('Upload failed'); }
    }
    setUploading(false);
  };

  const generateDescription = async () => {
    if (!form.name) { toast.error('Enter product name first'); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/ai-stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Write a premium, compelling product description for a Nigerian fashion marketplace listing for: "${form.name}" in the ${form.category || 'fashion'} category. Keep it under 100 words. Make it luxurious and enticing. Do not include any outfit recommendations.`, history: [] }),
      });
      const data = await res.json();
      const desc = data.message?.replace(/<recommendations>[\s\S]*?<\/recommendations>/, '').trim();
      setForm(f => ({ ...f, description: desc || '' }));
      toast.success('Description generated! ✦');
    } catch { toast.error('Generation failed'); }
    setGenerating(false);
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
      setTagInput('');
    }
  };

  const addColor = () => {
    const c = colorInput.trim();
    if (c && !form.colors.includes(c)) {
      setForm(f => ({ ...f, colors: [...f.colors, c] }));
      setColorInput('');
    }
  };

  const toggleSize = (s: string) => {
    setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] }));
  };

  const handleSubmit = async () => {
    if (!form.name) { toast.error('Product name required'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { toast.error('Valid price required'); return; }
    if (images.length === 0) { toast.error('Add at least one image'); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Please login'); router.push('/auth/login'); return; }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || !['seller', 'admin'].includes(profile.role)) {
      toast.error('Seller account required');
      router.push('/auth/signup?seller=true');
      return;
    }

    setSubmitting(true);
    let categoryId = null;
    if (form.category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('name', form.category).single();
      categoryId = cat?.id;
    }

    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', session.user.id).single();
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const { error } = await supabase.from('products').insert({
      seller_id: session.user.id,
      store_id: store?.id,
      category_id: categoryId,
      name: form.name,
      slug,
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      images,
      thumbnail: images[0],
      sizes: form.sizes,
      colors: form.colors,
      tags: form.tags,
      stock: parseInt(form.stock) || 10,
      condition: form.condition,
      is_active: true,
      is_approved: profile.role === 'admin',
    });

    if (error) { toast.error(error.message); }
    else {
      toast.success(profile.role === 'admin' ? 'Product posted! ✦' : 'Product submitted for review! ✦');
      router.push('/dashboard/seller');
    }
    setSubmitting(false);
  };

  const inp = { width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' as const };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'serif', fontSize: '1.6rem', fontWeight: 300, color: '#fff', margin: 0 }}>Create Post</h1>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ background: 'linear-gradient(135deg,#C8A96B,#A8872A)', border: 'none', color: '#000', borderRadius: 50, padding: '9px 20px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Image upload */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Photos ({images.length}/6)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', paddingTop: '100%', background: '#1a1a1a', borderRadius: 10, overflow: 'hidden' }}>
                <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={12} />
                </button>
                {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', color: '#C8A96B', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 50 }}>Cover</span>}
              </div>
            ))}
            {images.length < 6 && (
              <button onClick={() => fileRef.current?.click()}
                style={{ paddingTop: '100%', position: 'relative', background: '#1a1a1a', borderRadius: 10, border: '2px dashed rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {uploading ? <div style={{ width: 20, height: 20, border: '2px solid rgba(200,169,107,0.3)', borderTopColor: '#C8A96B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Upload size={20} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{uploading ? 'Uploading...' : 'Add Photo'}</span>
                </div>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
        </div>

        {/* Product name */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Title *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Black Leather Handbag" style={inp} />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
            <button onClick={generateDescription} disabled={generating}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 50, padding: '4px 10px', fontSize: '0.7rem', color: '#a78bfa', cursor: 'pointer' }}>
              <Sparkles size={11} /> {generating ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe your product..."
            style={{ ...inp, minHeight: 90, resize: 'none', lineHeight: 1.6 }} />
        </div>

        {/* Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Price (₦) *</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 12500" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Original Price (₦)</label>
            <input type="number" value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} placeholder="e.g. 18000" style={inp} />
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Category</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                style={{ padding: '6px 12px', borderRadius: 50, border: `1px solid ${form.category === c ? 'rgba(200,169,107,0.5)' : 'rgba(255,255,255,0.1)'}`, background: form.category === c ? 'rgba(200,169,107,0.12)' : 'none', color: form.category === c ? '#C8A96B' : 'rgba(255,255,255,0.45)', fontSize: '0.78rem', cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Sizes Available</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SIZES.map(s => (
              <button key={s} onClick={() => toggleSize(s)}
                style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${form.sizes.includes(s) ? '#C8A96B' : 'rgba(255,255,255,0.1)'}`, background: form.sizes.includes(s) ? '#C8A96B' : 'none', color: form.sizes.includes(s) ? '#000' : 'rgba(255,255,255,0.45)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: form.sizes.includes(s) ? 600 : 400 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Colors</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            {form.colors.map(c => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '4px 10px', fontSize: '0.75rem', color: '#fff' }}>
                {c} <button onClick={() => setForm(f => ({ ...f, colors: f.colors.filter(x => x !== c) }))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addColor()}
              placeholder="e.g. Black, Red..." style={{ ...inp, flex: 1 }} />
            <button onClick={addColor} style={{ padding: '11px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem', flexShrink: 0 }}>Add</button>
          </div>
        </div>

        {/* Hashtags */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Hashtags</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            {form.tags.map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 50, padding: '4px 10px', fontSize: '0.75rem', color: '#a78bfa' }}>
                #{t} <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.5)', cursor: 'pointer', padding: 0 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="#fashion #luxury #streetwear" style={{ ...inp, flex: 1 }} />
            <button onClick={addTag} style={{ padding: '11px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem', flexShrink: 0 }}>Add</button>
          </div>
        </div>

        {/* Stock */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Stock Quantity</label>
          <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="10" style={{ ...inp, maxWidth: 140 }} />
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', border: 'none', color: '#000', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Posting...' : '✦ Post Product'}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
