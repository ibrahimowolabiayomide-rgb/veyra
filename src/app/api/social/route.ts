import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, target_id, content } = await req.json();
  const userId = session.user.id;

  switch (action) {
    case 'follow': {
      if (target_id === userId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
      const { error } = await supabase.from('follows').insert({ follower_id: userId, following_id: target_id });
      if (!error) {
        // Send notification
        const { data: follower } = await supabase.from('profiles').select('full_name, username').eq('id', userId).single();
        await supabase.rpc('create_notification', {
          p_user_id: target_id, p_type: 'follow',
          p_title: `${follower?.full_name || follower?.username} started following you`,
          p_body: null, p_action_url: `/profile/${userId}`
        });
      }
      return NextResponse.json({ success: !error, error: error?.message });
    }

    case 'unfollow': {
      const { error } = await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', target_id);
      return NextResponse.json({ success: !error, error: error?.message });
    }

    case 'like': {
      const existing = await supabase.from('likes').select('id').eq('user_id', userId).eq('product_id', target_id).single();
      if (existing.data) {
        await supabase.from('likes').delete().eq('user_id', userId).eq('product_id', target_id);
        return NextResponse.json({ liked: false });
      } else {
        await supabase.from('likes').insert({ user_id: userId, product_id: target_id });
        // Notify seller
        const { data: product } = await supabase.from('products').select('seller_id, name').eq('id', target_id).single();
        if (product && product.seller_id !== userId) {
          const { data: liker } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
          await supabase.rpc('create_notification', {
            p_user_id: product.seller_id, p_type: 'like',
            p_title: `${liker?.full_name} liked your product`,
            p_body: product.name, p_action_url: `/product/${target_id}`
          });
        }
        return NextResponse.json({ liked: true });
      }
    }

    case 'bookmark': {
      const existing = await supabase.from('bookmarks').select('id').eq('user_id', userId).eq('product_id', target_id).single();
      if (existing.data) {
        await supabase.from('bookmarks').delete().eq('user_id', userId).eq('product_id', target_id);
        return NextResponse.json({ bookmarked: false });
      } else {
        await supabase.from('bookmarks').insert({ user_id: userId, product_id: target_id });
        return NextResponse.json({ bookmarked: true });
      }
    }

    case 'comment': {
      if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
      const { data, error } = await supabase.from('comments').insert({
        user_id: userId, product_id: target_id, content: content.trim()
      }).select('*, profiles(username, full_name, avatar_url)').single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      // Notify seller
      const { data: product } = await supabase.from('products').select('seller_id, name').eq('id', target_id).single();
      if (product && product.seller_id !== userId) {
        const { data: commenter } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
        await supabase.rpc('create_notification', {
          p_user_id: product.seller_id, p_type: 'comment',
          p_title: `${commenter?.full_name} commented on your product`,
          p_body: content.substring(0, 80), p_action_url: `/product/${target_id}`
        });
      }
      return NextResponse.json({ comment: data });
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const target_id = searchParams.get('target_id');
  const { data: { session } } = await supabase.auth.getSession();

  if (action === 'comments' && target_id) {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(id, username, full_name, avatar_url)')
      .eq('product_id', target_id)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(50);
    return NextResponse.json({ comments: data || [] });
  }

  if (action === 'status' && target_id && session) {
    const [liked, bookmarked, followed] = await Promise.all([
      supabase.from('likes').select('id').eq('user_id', session.user.id).eq('product_id', target_id).single(),
      supabase.from('bookmarks').select('id').eq('user_id', session.user.id).eq('product_id', target_id).single(),
      supabase.from('follows').select('id').eq('follower_id', session.user.id).eq('following_id', target_id).single(),
    ]);
    return NextResponse.json({ liked: !!liked.data, bookmarked: !!bookmarked.data, followed: !!followed.data });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
