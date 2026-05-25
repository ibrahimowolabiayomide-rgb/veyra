'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, Share2, ShoppingCart, MessageCircle, Star, ChevronLeft, ChevronRight, Sparkles, Shield, Truck, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [aiOutfit, setAiOutfit] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details'|'comments'|'reviews'>('details');
  const router = useRouter();
  const supabase = createClient();
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => { loadProduct(); }, [params.id]);

  const loadProduct = async () => {
    const { data } = await supabase.from('products')
      .select('*, categories(name,slug), stores(id,store_name,store_slug,logo_url,rating,total_sales,is_verified,follower_count,description)')
      .eq('id', params.id).single();
    if (data) {
      setProduct(data);
      setLikeCount(data.like_count || 0);
      setSelectedColor(data.colors?.[0] || '');
      loadRelated(data.category_id);
      loadComments();
      checkUserStatus(data);
    }
    setLoading(false);
  };

  const loadRelated = async (catId: string) => {
    const { data } = await supabase.from('products')
      .select('id,name,price,thumbnail,images')
      .eq('category_id', catId).neq('id', params.id).limit(6);
    setRelatedProducts(data || []);
  };

  const loadComments = async () => {
    const { data } = await supabase.from('comments')
      .select('*, profiles(username,full_name,avatar_url)')
      .eq('product_id', params.id).order('created_at', { ascending: false }).limit(20);
    setComments(data || []);
  };

  const checkUserStatus = async (p: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const [likeRes, saveRes] = await Promise.all([
      supabase.from('likes').select('id').eq('user_id', session.user.id).eq('product_id', p.id).single(),
      supabase.from('bookmarks').select('id').eq('user_id', session.user.id).eq('product_id', p.id).single(),
    ]);
    setLiked(!!likeRes.data);
    setSaved(!!saveRes.data);
  };

  const handleLike = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to like'); router.push('/auth/login'); return; }
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', session.user.id).eq('product_id', params.id);
      setLiked(false); setLikeCount(c => c - 1);
    } else {
      await supabase.from('likes').insert({ user_id: session.user.id, product_id: params.id });
      setLiked(true); setLikeCount(c => c + 1);
    }
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to save'); router.push('/auth/login'); return; }
    if (saved) {
      await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('product_id', params.id);
      setSaved(false); toast.success('Removed from saved');
    } else {
      await supabase.from('bookmarks').insert({ user_id: session.user.id, product_id: params.id });
      setSaved(true); toast.success('Saved! ♡');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) { toast.error('Please select a size'); return; }
    addItem({ id: `${params.id}-${selectedSize}-${selectedColor}`, productId: params.id, name: product.name, price: product.price, image: product.thumbnail || '', size: selectedSize, color: selectedColor, quantity: qty, sellerName: product.stores?.store_name || '' });
    toast.success('Added to cart! 🛍️');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleMessageSeller = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to message seller'); router.push('/auth/login'); return; }
    router.push(`/messages?seller=${product.stores?.id}`);
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to comment'); router.push('/auth/login'); return; }
    const { data } = await supabase.from('comments')
      .insert({ user_id: session.user.id, product_id: params.id, content: newComment.trim() })
      .select('*, profiles(username,full_name,avatar_url)').single();
    if (data) { setComments(prev => [data, ...prev]); setNewComment(''); toast.success('Comment posted!'); }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: product?.name, url }); }
    else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  const generateOutfit = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Generate a complete outfit combination featuring: "${product?.name}". Suggest 3 complementary items.`, history: [] }),
      });
      const data = await res.json();
      setAiOutfit(data.message?.replace(/<recommendations>[\s\S]*?<\/recommendations>/, '').trim() || '');
    } catch { setAiOutfit(`Style the ${product?.name} with complementary pieces — try pairing it with neutral basics and statement accessories for a complete look. ✦`); }
    setAiLoading(false);
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m/60)}h ago`;
    return `${Math.floor(m/1440)}d ago`;
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', paddingTop:56, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'2px solid rgba(200,169,107,0.3)', borderTopColor:'#C8A96B', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', paddingTop:56, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)' }}>
      <p style={{ fontSize:'2rem', marginBottom:8 }}>◈</p>
      <p>Product not found</p>
      <Link href="/marketplace" style={{ marginTop:16, color:'#C8A96B', textDecoration:'none' }}>Browse Marketplace</Link>
    </div>
  );

  const imgs = [product.thumbnail, ...(product.images || [])].filter(Boolean);
  const disc = product.compare_price && product.compare_price > product.price ? Math.round((1-product.price/product.compare_price)*100) : null;

  return (
    <div style={{ background:'#0a0a0a', minHeight:'100vh', paddingTop:56, paddingBottom:80 }}>
      {/* Back button */}
      <div style={{ padding:'10px 1rem', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', padding:0 }}>
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      {/* Main image */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'1', background:'#111', overflow:'hidden' }}>
        {imgs[selectedImg] ? (
          <img src={imgs[selectedImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
            <span style={{ fontFamily:'serif', fontSize:'6rem', opacity:0.08, color:'#8B5CF6' }}>{product.name?.charAt(0)}</span>
          </div>
        )}
        {disc && <span style={{ position:'absolute', top:12, left:12, background:'#ef4444', color:'#fff', fontSize:'0.7rem', fontWeight:700, padding:'3px 9px', borderRadius:50 }}>-{disc}%</span>}
        {/* Image nav arrows */}
        {imgs.length > 1 && (
          <>
            <button onClick={() => setSelectedImg(i => Math.max(0, i-1))} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={16} /></button>
            <button onClick={() => setSelectedImg(i => Math.min(imgs.length-1, i+1))} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronRight size={16} /></button>
          </>
        )}
        {/* Like & Save */}
        <div style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={handleLike} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:liked?'#ef4444':'#fff' }}>
            <Heart size={16} fill={liked?'#ef4444':'none'} />
          </button>
          <button onClick={handleSave} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:saved?'#C8A96B':'#fff' }}>
            <Bookmark size={16} fill={saved?'#C8A96B':'none'} />
          </button>
          <button onClick={handleShare} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div style={{ display:'flex', gap:6, padding:'8px 1rem', overflowX:'auto', scrollbarWidth:'none' }}>
          {imgs.map((img, i) => (
            <button key={i} onClick={() => setSelectedImg(i)}
              style={{ flexShrink:0, width:60, height:60, borderRadius:8, overflow:'hidden', border:`2px solid ${selectedImg===i?'#C8A96B':'rgba(255,255,255,0.1)'}`, background:'#111', cursor:'pointer', padding:0 }}>
              <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Product info */}
      <div style={{ padding:'12px 1rem' }}>
        <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{product.categories?.name}</p>
        <h1 style={{ fontFamily:'serif', fontSize:'clamp(1.4rem,4vw,2rem)', fontWeight:300, color:'#fff', marginBottom:8, lineHeight:1.2 }}>{product.name}</h1>

        {/* Rating & likes */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <div style={{ display:'flex', gap:2 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(product.rating||0) ? '#C8A96B' : 'rgba(255,255,255,0.2)', fontSize:'0.85rem' }}>★</span>)}
          </div>
          <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)' }}>{product.rating || '—'} ({product.review_count || 0})</span>
          <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.3)' }}>·</span>
          <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)' }}>{likeCount} likes</span>
        </div>

        {/* Price */}
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:16 }}>
          <span style={{ fontSize:'1.8rem', fontWeight:600, color:'#fff' }}>₦{Number(product.price).toLocaleString()}</span>
          {product.compare_price && <span style={{ fontSize:'1rem', color:'rgba(255,255,255,0.35)', textDecoration:'line-through' }}>₦{Number(product.compare_price).toLocaleString()}</span>}
          {disc && <span style={{ fontSize:'0.8rem', color:'#4ade80' }}>Save {disc}%</span>}
        </div>

        {/* Colors */}
        {product.colors?.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Color: <span style={{ color:'#fff', textTransform:'none', letterSpacing:0 }}>{selectedColor}</span></p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {product.colors.map((c: string) => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  style={{ padding:'6px 14px', borderRadius:50, border:`1px solid ${selectedColor===c?'#C8A96B':'rgba(255,255,255,0.15)'}`, background:selectedColor===c?'rgba(200,169,107,0.12)':'none', color:selectedColor===c?'#C8A96B':'rgba(255,255,255,0.6)', fontSize:'0.82rem', cursor:'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
              Size {!selectedSize && <span style={{ color:'#ef4444', textTransform:'none', letterSpacing:0 }}>— select</span>}
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {product.sizes.map((s: string) => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  style={{ width:44, height:40, borderRadius:10, border:`1px solid ${selectedSize===s?'rgba(200,169,107,0.6)':'rgba(255,255,255,0.15)'}`, background:selectedSize===s?'#C8A96B':'none', color:selectedSize===s?'#000':'rgba(255,255,255,0.6)', fontSize:'0.82rem', cursor:'pointer', fontWeight:selectedSize===s?600:400 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>Qty:</p>
          <div style={{ display:'flex', alignItems:'center', background:'#1a1a1a', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:36, height:36, background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'1.1rem' }}>−</button>
            <span style={{ width:32, textAlign:'center', fontSize:'0.9rem', color:'#fff' }}>{qty}</span>
            <button onClick={() => setQty(q => q+1)} style={{ width:36, height:36, background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'1.1rem' }}>+</button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display:'flex', gap:10, marginBottom:12 }}>
          <button onClick={handleBuyNow}
            style={{ flex:1, padding:'13px', borderRadius:12, background:'linear-gradient(135deg,#C8A96B,#A8872A)', border:'none', color:'#000', fontSize:'0.9rem', fontWeight:700, cursor:'pointer' }}>
            Buy Now
          </button>
          <button onClick={handleMessageSeller}
            style={{ flex:1, padding:'13px', borderRadius:12, background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', fontSize:'0.9rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <MessageCircle size={16} /> Message Seller
          </button>
        </div>
        <button onClick={handleAddToCart}
          style={{ width:'100%', padding:'11px', borderRadius:12, background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', fontSize:'0.88rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <ShoppingCart size={15} /> Add to Cart
        </button>

        {/* Trust badges */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
            <Shield size={14} style={{ color:'#4ade80', flexShrink:0 }} />
            <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.45)', lineHeight:1.3 }}>Buyer Protection Guaranteed</span>
          </div>
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
            <Truck size={14} style={{ color:'#C8A96B', flexShrink:0 }} />
            <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.45)', lineHeight:1.3 }}>Free delivery on ₦20k+</span>
          </div>
        </div>
      </div>

      {/* Seller info card */}
      {product.stores && (
        <div style={{ margin:'0 1rem 1rem', background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
              {product.stores.logo_url ? <img src={product.stores.logo_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" /> : <span style={{ color:'#fff', fontSize:'1rem', fontWeight:600 }}>{product.stores.store_name?.charAt(0)}</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <p style={{ fontSize:'0.88rem', fontWeight:600, color:'#fff', margin:0 }}>{product.stores.store_name}</p>
                {product.stores.is_verified && <span style={{ fontSize:'0.65rem', color:'#3B82F6', background:'rgba(59,130,246,0.12)', borderRadius:50, padding:'1px 6px' }}>✓ Verified</span>}
              </div>
              <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', margin:'2px 0 0' }}>★ {product.stores.rating || '—'} · {(product.stores.total_sales || 0).toLocaleString()} sales</p>
            </div>
            <Link href={`/seller/${product.stores.store_slug || product.stores.id}`}
              style={{ padding:'7px 14px', borderRadius:50, border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', textDecoration:'none', flexShrink:0 }}>
              Visit Store
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', margin:'0 1rem', gap:0 }}>
        {(['details','comments','reviews'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding:'10px 16px', fontSize:'0.82rem', fontWeight:500, background:'none', border:'none', cursor:'pointer', color:activeTab===tab?'#fff':'rgba(255,255,255,0.35)', borderBottom:activeTab===tab?'2px solid #C8A96B':'2px solid transparent', marginBottom:-1, textTransform:'capitalize' }}>
            {tab} {tab==='comments'&&`(${comments.length})`}
          </button>
        ))}
      </div>

      <div style={{ padding:'14px 1rem' }}>
        {/* Details tab */}
        {activeTab === 'details' && (
          <div>
            <p style={{ fontSize:'0.88rem', color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:16 }}>{product.description || 'Premium quality product from a verified VEYRA seller.'}</p>
            {product.tags?.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {product.tags.map((t: string) => (
                  <span key={t} style={{ fontSize:'0.72rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:50, padding:'3px 10px', color:'rgba(255,255,255,0.4)' }}>#{t}</span>
                ))}
              </div>
            )}
            {/* AI outfit generator */}
            <div style={{ marginTop:16, background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.05))', border:'1px solid rgba(139,92,246,0.2)', borderRadius:14, padding:'14px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:aiOutfit?10:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Sparkles size={15} style={{ color:'#a78bfa' }} />
                  <div>
                    <p style={{ fontSize:'0.85rem', fontWeight:500, color:'#fff', margin:0 }}>AI Outfit Generator</p>
                    <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', margin:0 }}>Build a complete look around this item</p>
                  </div>
                </div>
                <button onClick={generateOutfit} disabled={aiLoading}
                  style={{ background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', border:'none', color:'#fff', borderRadius:50, padding:'7px 14px', fontSize:'0.78rem', cursor:'pointer', flexShrink:0 }}>
                  {aiLoading ? '...' : 'Generate'}
                </button>
              </div>
              {aiOutfit && <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', lineHeight:1.6, margin:0 }}>{aiOutfit}</p>}
            </div>
          </div>
        )}

        {/* Comments tab */}
        {activeTab === 'comments' && (
          <div>
            {/* Add comment */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={e => e.key==='Enter' && handleComment()}
                style={{ flex:1, background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'9px 14px', color:'#fff', fontSize:'0.85rem', outline:'none' }} />
              <button onClick={handleComment}
                style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#C8A96B,#A8872A)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Send size={14} style={{ color:'#000' }} />
              </button>
            </div>
            {comments.length === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem', textAlign:'center', padding:'2rem 0' }}>No comments yet. Be the first!</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display:'flex', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                      {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" /> : <span style={{ fontSize:'0.7rem', color:'#fff', fontWeight:600 }}>{c.profiles?.full_name?.charAt(0) || '?'}</span>}
                    </div>
                    <div style={{ flex:1, background:'#111', borderRadius:12, padding:'8px 12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#fff' }}>{c.profiles?.full_name || c.profiles?.username}</span>
                        <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)' }}>{timeAgo(c.created_at)}</span>
                      </div>
                      <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', margin:0, lineHeight:1.5 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:16, background:'#111', borderRadius:14, padding:'14px', marginBottom:16 }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:'serif', fontSize:'3rem', color:'#fff', margin:0, lineHeight:1 }}>{product.rating || '—'}</p>
                <div style={{ display:'flex', gap:2, justifyContent:'center', margin:'4px 0' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=Math.round(product.rating||0)?'#C8A96B':'rgba(255,255,255,0.2)', fontSize:'0.85rem' }}>★</span>)}
                </div>
                <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', margin:0 }}>{product.review_count || 0} reviews</p>
              </div>
              <div style={{ flex:1 }}>
                {[5,4,3,2,1].map(n => (
                  <div key={n} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', width:8 }}>{n}</span>
                    <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                      <div style={{ width: n === 5 ? '70%' : n === 4 ? '20%' : '5%', height:'100%', background:'#C8A96B', borderRadius:2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem', textAlign:'center', padding:'1rem 0' }}>Purchase the item to leave a review.</p>
          </div>
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div style={{ padding:'0 1rem 1rem' }}>
          <p style={{ fontSize:'0.72rem', color:'#C8A96B', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:14, height:1, background:'#C8A96B', display:'inline-block' }} /> You May Also Like
          </p>
          <div style={{ display:'flex', gap:10, overflowX:'auto', scrollbarWidth:'none' }}>
            {relatedProducts.map(p => {
              const img = p.thumbnail || p.images?.[0];
              return (
                <Link key={p.id} href={`/product/${p.id}`} style={{ flexShrink:0, width:130, textDecoration:'none' }}>
                  <div style={{ background:'#111', borderRadius:12, overflow:'hidden' }}>
                    <div style={{ paddingTop:'130%', position:'relative', background:'#1a1a1a' }}>
                      {img && <img src={img} alt={p.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
                    </div>
                    <div style={{ padding:'6px 8px' }}>
                      <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.7)', margin:'0 0 2px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.3 }}>{p.name}</p>
                      <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#fff', margin:0 }}>₦{Number(p.price).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:0;height:0} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
