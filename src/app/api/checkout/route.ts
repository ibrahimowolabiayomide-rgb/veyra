import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items, shipping_address, coupon } = await req.json();
  if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    const { data: product } = await supabase.from('products').select('price, stock').eq('id', item.productId).single();
    if (!product) return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
    if (product.stock < item.quantity) return NextResponse.json({ error: `${item.name} is out of stock` }, { status: 400 });
    subtotal += product.price * item.quantity;
  }

  const shipping_fee = subtotal >= 20000 ? 0 : 1500;
  const discount = coupon === 'VEYRA10' ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount + shipping_fee;

  // Create order in DB
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    customer_id: session.user.id,
    subtotal, shipping_fee, discount, total,
    shipping_address,
    status: 'pending',
    payment_status: 'pending',
  }).select().single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 });

  // Insert order items
  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.productId,
    store_id: item.storeId || null,
    seller_id: item.sellerId || null,
    quantity: item.quantity,
    size: item.size || null,
    color: item.color || null,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));
  await supabase.from('order_items').insert(orderItems);

  // Initialize Paystack payment
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    // Demo mode - return mock
    return NextResponse.json({
      authorization_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.id}&demo=true`,
      reference: `VYR-DEMO-${Date.now()}`,
      order_id: order.id,
    });
  }

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: session.user.email,
      amount: Math.round(total * 100), // Paystack uses kobo
      reference: `VYR-${order.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify`,
      metadata: { order_id: order.id, customer_id: session.user.id },
    }),
  });

  const paystackData = await paystackRes.json();
  if (!paystackData.status) return NextResponse.json({ error: 'Payment initialization failed' }, { status: 400 });

  // Save reference to order
  await supabase.from('orders').update({ payment_reference: paystackData.data.reference }).eq('id', order.id);

  return NextResponse.json({
    authorization_url: paystackData.data.authorization_url,
    reference: paystackData.data.reference,
    order_id: order.id,
  });
}
