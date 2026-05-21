import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const type = searchParams.get('type') || 'all'; // all, products, users, stores
  const limit = parseInt(searchParams.get('limit') || '20');

  // Return trending if no query
  if (!q) {
    const { data: trending } = await supabase
      .from('trending_searches')
      .select('query, count')
      .order('count', { ascending: false })
      .limit(10);
    return NextResponse.json({ trending: trending || [] });
  }

  // Record search
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.rpc('record_search', { p_query: q, p_user_id: session?.user?.id || null });

  const results: any = {};

  if (type === 'all' || type === 'products') {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, thumbnail, rating, sold_count, stores(store_name), categories(name)')
      .eq('is_approved', true)
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%,tags.cs.{${q}}`)
      .order('sold_count', { ascending: false })
      .limit(limit);
    results.products = products || [];
  }

  if (type === 'all' || type === 'users') {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, role, is_verified, follower_count')
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .eq('is_suspended', false)
      .limit(10);
    results.users = users || [];
  }

  if (type === 'all' || type === 'stores') {
    const { data: stores } = await supabase
      .from('stores')
      .select('id, store_name, store_slug, logo_url, rating, is_verified, total_sales')
      .or(`store_name.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('is_active', true)
      .limit(10);
    results.stores = stores || [];
  }

  return NextResponse.json({ query: q, results });
}
