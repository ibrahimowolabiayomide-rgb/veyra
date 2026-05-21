import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// GET /api/products - list products with filters
export async function GET(req: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category');
  const seller = searchParams.get('seller');
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const featured = searchParams.get('featured');
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('products')
    .select(`
      *,
      categories(name, slug, icon),
      stores(store_name, store_slug, logo_url, is_verified),
      profiles!seller_id(username, avatar_url)
    `, { count: 'exact' })
    .eq('is_approved', true)
    .eq('is_active', true);

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (seller) query = query.eq('seller_id', seller);
  if (featured === 'true') query = query.eq('is_featured', true);
  if (minPrice) query = query.gte('price', parseFloat(minPrice));
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'popular': query = query.order('sold_count', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    case 'liked': query = query.order('like_count', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    products: data,
    pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
  });
}

// POST /api/products - create product (sellers only)
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (!profile || !['seller', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Seller account required' }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, price, compare_price, category_id, images, sizes, colors, tags, stock, brand } = body;

  // Validation
  if (!name || !price) return NextResponse.json({ error: 'Name and price required' }, { status: 400 });
  if (price <= 0) return NextResponse.json({ error: 'Price must be positive' }, { status: 400 });

  // Get seller's store
  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', session.user.id).single();

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

  const { data, error } = await supabase.from('products').insert({
    seller_id: session.user.id,
    store_id: store?.id,
    category_id,
    name, slug, description, price,
    compare_price: compare_price || null,
    images: images || [],
    thumbnail: images?.[0] || null,
    sizes: sizes || [],
    colors: colors || [],
    tags: tags || [],
    stock: stock || 0,
    brand: brand || null,
    is_active: true,
    is_approved: profile.role === 'admin', // auto-approve admin products
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ product: data }, { status: 201 });
}
