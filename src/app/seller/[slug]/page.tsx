'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, MessageCircle, UserPlus, UserCheck, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function SellerPage({ params }: { params: { slug: string } }) {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<'posts'|'products'|'reviews'>('posts');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { loadStore(); }, [params.slug]);

  const loadStore = async () => {
    const { data } = await supabase.from('stores')
      .select('*, profiles!owner_id(id, full_name, username, avatar_url, bio, follower_count, following_count, created_at)')
      .or(`store_slug.eq.${params.slug},id.eq.${params.slug}`).single();
    if (data) {
      setStore(data);
      loadProducts(data.id);
    }
    setLoading(false);
  };

  const loadProducts = async (storeId: string) => {
    const { data } = await supabase.from('products').select('id,name,price,thumbnail,images,like_count,rating').eq('store_id', storeId).order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const handleFollow = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to follow'); router.push('/auth/login'); return; }
    if (following) {
      await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', store.profiles?.id);
      setFollowing(false); toast.success('Unfollowed');
    } else {
      await supabase.from('follows').insert({ follower_id: session.user.id, following_id: store.profiles?.id });
      setFollowing(true); toast.success('Following! ✦');
    }
  };

  const col1: any[] = [], col2: any[] = [], col3: any[] = [];
  products.forEach((p, i) => { if (i%3===0) col1.push(p); else if (i%3===1) col2.push(p); else col3.push(p); });

  if (loading) return <div style={{ minHeight:'100vh', background:'#0a0a0a', paddingTop:56, display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:28, height:28, border:'2px solid rgba(200,169,107,0.3)', borderTopColor:'#C8A96B', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!store) return <div style={{ minHeight:'100vh', background:'#0a0a0a', paddingTop:56, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)' }}>Store not found</div>;

  return (
    <div style={{ background:'#0a0a0a', minHeight:'100vh', paddingTop:56, paddingBottom:70 }}>
      {/* Cover */}
      <div style={{ height:120, background:`linear-gradient(135deg,#1a0030,#0d0020,#000a15)`, position:'relative' }}>
        {store.banner_url && <img src={store.banner_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
      </div>

      {/* Profile section */}
      <div style={{ padding:'0 1rem', position:'relative' }}>
        {/* Avatar */}
        <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', border:'3px solid #0a0a0a', marginTop:-36, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
          {store.logo_url ? <img src={store.logo_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" /> : <span style={{ fontFamily:'serif', fontSize:'2rem', color:'#fff' }}>{store.store_name?.charAt(0)}</span>}
        </div>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <h1 style={{ fontSize:'1.1rem', fontWeight:600, color:'#fff', margin:0 }}>{store.store_name}</h1>
              {store.is_verified && <span style={{ fontSize:'0.65rem', color:'#3B82F6', background:'rgba(59,130,246,0.12)', borderRadius:50, padding:'2px 7px' }}>✓ Verified</span>}
            </div>
            <p style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.35)', margin:'2px 0 0' }}>@{store.store_slug}</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleFollow}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', borderRadius:50, border:`1px solid ${following?'rgba(255,255,255,0.2)':'rgba(200,169,107,0.4)'}`, background:following?'rgba(255,255,255,0.05)':'rgba(200,169,107,0.1)', color:following?'rgba(255,255,255,0.6)':'#C8A96B', fontSize:'0.82rem', cursor:'pointer', fontWeight:500 }}>
              {following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
            </button>
            <button onClick={() => router.push(`/messages?seller=${store.id}`)}
              style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.6)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <MessageCircle size={16} />
            </button>
          </div>
        </div>

        {store.description && <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.5)', lineHeight:1.5, marginBottom:12 }}>{store.description}</p>}

        {/* Stats */}
        <div style={{ display:'flex', gap:20, marginBottom:16, paddingBottom:16, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {[[products.length,'Posts'],[store.follower_count||0,'Followers'],[store.following_count||0,'Following']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <p style={{ fontSize:'1.1rem', fontWeight:600, color:'#fff', margin:0 }}>{Number(n).toLocaleString()}</p>
              <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', margin:0 }}>{l}</p>
            </div>
          ))}
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:'1.1rem', fontWeight:600, color:'#fff', margin:0 }}>₦{(store.total_revenue||0).toLocaleString()}</p>
            <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', margin:0 }}>Sales</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 1rem' }}>
        {(['posts','products','reviews'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:'10px 0', fontSize:'0.82rem', fontWeight:500, background:'none', border:'none', cursor:'pointer', color:tab===t?'#fff':'rgba(255,255,255,0.35)', borderBottom:tab===t?'2px solid #C8A96B':'2px solid transparent', marginBottom:-1, textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:'8px 6px' }}>
        {tab === 'posts' || tab === 'products' ? (
          products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 1rem', color:'rgba(255,255,255,0.3)' }}>
              <ShoppingBag size={40} style={{ margin:'0 auto 12px', opacity:0.3 }} />
              <p>No products yet</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4 }}>
              {[col1,col2,col3].map((col,ci) => (
                <div key={ci} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {col.map((p,pi) => {
                    const img = p.thumbnail||p.images?.[0];
                    const pts = ['110%','90%','125%','100%','115%'];
                    return (
                      <Link key={p.id} href={`/product/${p.id}`} style={{ display:'block', textDecoration:'none', position:'relative', borderRadius:8, overflow:'hidden', background:'#1a1a1a' }}>
                        <div style={{ paddingTop:pts[(ci+pi*2)%pts.length], position:'relative' }}>
                          {img ? <img src={img} alt={p.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ position:'absolute', inset:0, background:'#1a1a2e' }} />}
                          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding:'6px 6px 4px' }}>
                            <p style={{ fontSize:'0.65rem', fontWeight:600, color:'#fff', margin:0 }}>₦{Number(p.price).toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ padding:'1rem', textAlign:'center', color:'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize:'0.85rem' }}>No reviews yet.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:0;height:0}`}</style>
    </div>
  );
}
