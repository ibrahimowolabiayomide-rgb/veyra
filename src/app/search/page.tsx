'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, Heart, X, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';

const CATS = ['All','Dresses','Long Dress','Short Dress','Party Wear','Casual','Streetwear','Luxury','Shoes','Bags','Accessories','Native Wear'];

function SearchContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(sp.get('q') || '');
  const [inputQ, setInputQ] = useState(sp.get('q') || '');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('newest');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createClient();
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => { fetchProducts(); }, [q, cat, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products')
      .select('id,name,price,compare_price,thumbnail,images,rating,sold_count,stores(store_name,is_verified),categories(name)')
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`);
    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'popular') query = query.order('sold_count', { ascending: false });
    else query = query.order('created_at', { ascending: false });
    const { data } = await query.limit(40);
    setProducts(data || []);
    setLoading(false);
  };

  const addToCart = (p: any) => {
    addItem({ id: p.id, productId: p.id, name: p.name, price: p.price, image: p.thumbnail || '', sellerName: p.stores?.store_name || '' });
    toast.success('Added to cart!');
  };

  return (
    <div style={{ background:'#0a0a0a', minHeight:'100vh', paddingTop:56, paddingBottom:70 }}>
      {/* Search header */}
      <div style={{ position:'sticky', top:56, zIndex:90, background:'rgba(10,10,10,0.97)', padding:'10px 1rem', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <form onSubmit={e => { e.preventDefault(); setQ(inputQ); }} style={{ display:'flex', gap:8, marginBottom:10 }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)' }} />
            <input value={inputQ} onChange={e => setInputQ(e.target.value)} placeholder="Search fashion..."
              style={{ width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'9px 36px', color:'#fff', fontSize:'0.85rem', outline:'none', boxSizing:'border-box' }} />
            {inputQ && <button type="button" onClick={() => { setInputQ(''); setQ(''); }} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', padding:0 }}><X size={14} /></button>}
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            style={{ padding:'0 14px', borderRadius:50, border:`1px solid ${showFilters?'rgba(200,169,107,0.4)':'rgba(255,255,255,0.1)'}`, background:showFilters?'rgba(200,169,107,0.08)':'#1a1a1a', color:showFilters?'#C8A96B':'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', flexShrink:0 }}>
            <SlidersHorizontal size={13} /> Filters
          </button>
        </form>

        {/* Filter bar */}
        {showFilters && (
          <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', paddingBottom:6 }}>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'6px 12px', color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', outline:'none', cursor:'pointer', flexShrink:0 }}>
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
        )}

        {/* Category pills */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', marginTop:8 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ flexShrink:0, padding:'5px 12px', borderRadius:50, border:`1px solid ${cat===c?'rgba(200,169,107,0.4)':'rgba(255,255,255,0.1)'}`, background:cat===c?'rgba(200,169,107,0.1)':'none', color:cat===c?'#C8A96B':'rgba(255,255,255,0.45)', fontSize:'0.75rem', cursor:'pointer', whiteSpace:'nowrap' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ padding:'10px 1rem', fontSize:'0.78rem', color:'rgba(255,255,255,0.3)' }}>
        {loading ? 'Searching...' : `${products.length} results${q ? ` for "${q}"` : ''}`}
      </div>

      {/* Products grid */}
      <div style={{ padding:'0 8px' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
            {Array(6).fill(0).map((_,i) => <div key={i} style={{ background:'#1a1a1a', borderRadius:12, paddingTop:'130%' }} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem 1rem', color:'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize:'2rem', marginBottom:8 }}>◈</p>
            <p>No results for "{q}"</p>
            <p style={{ fontSize:'0.85rem', marginTop:4 }}>Try different keywords</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
            {products.map(p => {
              const img = p.thumbnail || p.images?.[0];
              const disc = p.compare_price && p.compare_price > p.price ? Math.round((1-p.price/p.compare_price)*100) : null;
              return (
                <div key={p.id} style={{ background:'#111', borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <Link href={`/product/${p.id}`} style={{ display:'block', textDecoration:'none' }}>
                    <div style={{ position:'relative', paddingTop:'130%', background:'#1a1a1a', overflow:'hidden' }}>
                      {img ? <img src={img} alt={p.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" /> :
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#1a1a2e,#16213e)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontFamily:'serif', fontSize:'3rem', opacity:0.08, color:'#8B5CF6' }}>{p.name?.charAt(0)}</span>
                        </div>}
                      {disc && <span style={{ position:'absolute', top:8, left:8, background:'#ef4444', color:'#fff', fontSize:'0.6rem', fontWeight:700, padding:'2px 7px', borderRadius:50 }}>-{disc}%</span>}
                      <div style={{ position:'absolute', top:8, right:8, background:'rgba(10,10,10,0.8)', borderRadius:50, padding:'2px 7px', fontSize:'0.65rem', color:'#fff', fontWeight:600 }}>
                        ₦{Number(p.price).toLocaleString()}
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding:'8px 10px 10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                      <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.35)', margin:0, flex:1 }}>{p.stores?.store_name}</p>
                      {p.stores?.is_verified && <span style={{ fontSize:'0.55rem', color:'#3B82F6', background:'rgba(59,130,246,0.1)', borderRadius:50, padding:'1px 5px' }}>✓</span>}
                    </div>
                    <Link href={`/product/${p.id}`} style={{ textDecoration:'none' }}>
                      <p style={{ fontSize:'0.82rem', color:'#fff', margin:'0 0 6px', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.name}</p>
                    </Link>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => addToCart(p)}
                        style={{ flex:1, padding:'7px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'none', color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                        <ShoppingCart size={11} /> Add to Cart
                      </button>
                      <button onClick={() => setWishlist(prev => prev.includes(p.id)?prev.filter(i=>i!==p.id):[...prev,p.id])}
                        style={{ width:32, height:32, borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'none', color:wishlist.includes(p.id)?'#ef4444':'rgba(255,255,255,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Heart size={12} fill={wishlist.includes(p.id)?'#ef4444':'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{'::-webkit-scrollbar{width:0;height:0}'}</style>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0a0a0a', paddingTop:56, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)' }}>Searching...</div>}><SearchContent /></Suspense>;
}
