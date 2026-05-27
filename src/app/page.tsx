'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';

const TOP_CATS = ['All','Fashion','Shoes','Bags','Streetwear','Luxury','Beauty','Native Wear','Hoodies','Accessories','Gadgets'];

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');
  const [activecat, setActivecat] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [liked, setLiked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const seen = sessionStorage.getItem('veyra_seen');
    if (!seen) { setShowSplash(true); sessionStorage.setItem('veyra_seen','1'); }
    loadFeed();
  }, [activecat]);

  const loadFeed = async () => {
    setLoading(true);
    const { data } = await supabase.from('products')
      .select('id,name,price,compare_price,thumbnail,images,rating,sold_count,like_count,stores(store_name),categories(name,slug)')
      .order('created_at', { ascending: false }).limit(40);
    setProducts(data || []);
    setLoading(false);
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchQ.trim()) router.push('/search?q=' + encodeURIComponent(searchQ));
  };

  const col1: any[] = [], col2: any[] = [], col3: any[] = [];
  products.forEach((p, i) => {
    if (i % 3 === 0) col1.push(p);
    else if (i % 3 === 1) col2.push(p);
    else col3.push(p);
  });

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 70 }}>

        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(10,10,10,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', height:56, display:'flex', alignItems:'center', padding:'0 1rem', gap:10 }}>
          <Link href="/" style={{ fontFamily:'serif', fontSize:'1.3rem', fontWeight:300, letterSpacing:'0.3em', color:'#fff', textDecoration:'none', flexShrink:0 }}>VE<span style={{color:'#C8A96B'}}>Y</span>RA</Link>
          <form onSubmit={handleSearch} style={{ flex:1, maxWidth:480, position:'relative' }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)' }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search for dresses, shoes, bags, watches..."
              style={{ width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'8px 36px', color:'#fff', fontSize:'0.85rem', outline:'none', boxSizing:'border-box' }} />
          </form>
          <div style={{ display:'flex', gap:2, marginLeft:'auto' }}>
            {[['🏠','/'],['🔔','/notifications'],['💬','/messages'],['👤','/profile']].map(([icon,href]) => (
              <Link key={href} href={href} style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontSize:'1.1rem', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}>{icon}</Link>
            ))}
          </div>
        </div>

        <div style={{ position:'sticky', top:56, zIndex:90, background:'rgba(10,10,10,0.97)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', overflowX:'auto', scrollbarWidth:'none', padding:'0 1rem', height:40, alignItems:'center', gap:4 }}>
            {TOP_CATS.map(cat => (
              <button key={cat} onClick={() => setActivecat(cat)}
                style={{ flexShrink:0, padding:'0 12px', height:28, borderRadius:50, border:'none', background:activecat===cat?'rgba(200,169,107,0.15)':'none', color:activecat===cat?'#C8A96B':'rgba(255,255,255,0.4)', fontSize:'0.78rem', cursor:'pointer', whiteSpace:'nowrap' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 1rem' }}>
          {['popular','foryou'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding:'10px 18px', fontSize:'0.85rem', fontWeight:500, background:'none', border:'none', cursor:'pointer', color:activeTab===tab?'#fff':'rgba(255,255,255,0.35)', borderBottom:activeTab===tab?'2px solid #C8A96B':'2px solid transparent', marginBottom:-1 }}>
              {tab === 'popular' ? 'Popular' : 'For you'}
            </button>
          ))}
        </div>

        <div style={{ padding:'8px 6px' }}>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>
              {Array(9).fill(0).map((_,i) => (
                <div key={i} style={{ background:'#1a1a1a', borderRadius:10, paddingTop: i%2===0?'130%':'100%' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem 1rem', color:'rgba(255,255,255,0.3)' }}>
              <p style={{ fontSize:'2rem', marginBottom:8 }}>◈</p>
              <p>No posts yet</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>
              {[col1, col2, col3].map((col, ci) => (
                <div key={ci} style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {col.map((p, pi) => {
                    const img = p.thumbnail || p.images?.[0];
                    const isLiked = liked.includes(p.id);
                    const isSaved = saved.includes(p.id);
                    const pts = ['130%','100%','115%','90%','140%','105%'];
                    const pt = pts[(ci + pi * 2) % pts.length];
                    return (
                      <div key={p.id} style={{ position:'relative', borderRadius:10, overflow:'hidden', background:'#1a1a1a', cursor:'pointer' }}
                        onClick={() => router.push('/product/' + p.id)}>
                        <div style={{ paddingTop: pt, position:'relative' }}>
                          {img ? (
                            <img src={img} alt={p.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                          ) : (
                            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#1a1a2e,#16213e)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span style={{ fontFamily:'serif', fontSize:'2rem', opacity:0.1, color:'#8B5CF6' }}>{p.name?.charAt(0)}</span>
                            </div>
                          )}
                          <div style={{ position:'absolute', top:6, left:6, background:'rgba(10,10,10,0.8)', borderRadius:50, padding:'2px 7px', fontSize:'0.65rem', color:'#fff', fontWeight:600 }}>
                            ₦{Number(p.price).toLocaleString()}
                          </div>
                          <button onClick={e => { e.stopPropagation(); setSaved(prev => prev.includes(p.id)?prev.filter(i=>i!==p.id):[...prev,p.id]); }}
                            style={{ position:'absolute', top:6, right:6, width:26, height:26, borderRadius:'50%', background:'rgba(10,10,10,0.7)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:isSaved?'#C8A96B':'rgba(255,255,255,0.8)' }}>
                            <Bookmark size={12} fill={isSaved?'#C8A96B':'none'} />
                          </button>
                        </div>
                        <div style={{ padding:'6px 8px 8px' }}>
                          <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.75)', margin:'0 0 3px', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.name}</p>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <p style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.3)', margin:0 }}>{p.stores?.store_name || 'VEYRA'}</p>
                            <button onClick={e => { e.stopPropagation(); setLiked(prev => prev.includes(p.id)?prev.filter(i=>i!==p.id):[...prev,p.id]); }}
                              style={{ display:'flex', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer', color:isLiked?'#ef4444':'rgba(255,255,255,0.4)', fontSize:'0.62rem', padding:0 }}>
                              <Heart size={10} fill={isLiked?'#ef4444':'none'} />{(p.like_count||0)+(isLiked?1:0)}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{'::-webkit-scrollbar{width:0;height:0} *{-webkit-tap-highlight-color:transparent}'}</style>
    </>
  );
}
