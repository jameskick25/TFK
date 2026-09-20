'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getDeliveryCost } from '@/data/delivery-data';
import { sendTelegramNotification } from '@/utils/telegram';

// ── Single-item direct checkout (from product page) ───
export async function processCheckout(formData: FormData) {
  const supabase = await createAdminClient();
  
  const variantId = formData.get('variant_id') as string;
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const customerName = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const wilaya = formData.get('wilaya') as string;
  const commune = formData.get('commune') as string;
  const address = (formData.get('address') as string) || 'Bureau NOEST';
  const deliveryType = formData.get('delivery_type') as string;
  
  if (!variantId || !customerName || !phone) {
    return { error: "Données manquantes" };
  }

  // 1. Fetch variant and check stock
  const { data: variant, error: variantError } = await supabase
    .from('product_variants')
    .select('*, products(*)')
    .eq('id', variantId)
    .single();

  if (variantError || !variant) {
    return { error: "Produit non trouvé" };
  }

  if (variant.stock < quantity) {
    return { error: "Stock insuffisant. Ce produit vient d'être vendu." };
  }

  // 2. Calculate prices
  const priceAtTime = variant.products.price;
  const itemsTotal = priceAtTime * quantity;
  const deliveryCost = getDeliveryCost(wilaya, deliveryType as 'home' | 'office');
  const orderTotal = itemsTotal + deliveryCost;

  // 3. Decrement stock
  const { error: stockError } = await supabase
    .from('product_variants')
    .update({ stock: variant.stock - quantity })
    .eq('id', variantId)
    .gte('stock', quantity);

  if (stockError) {
    return { error: "Erreur lors de la mise à jour du stock." };
  }

  // 4. Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      phone,
      wilaya,
      commune,
      address,
      delivery_type: deliveryType,
      items_total: itemsTotal,
      delivery_cost: deliveryCost,
      order_total: orderTotal,
      status: 'nouvelle'
    })
    .select()
    .single();

  if (orderError) {
    return { error: "Erreur lors de la création de la commande." };
  }

  // 5. Create Order Item
  const variantInfo = `${variant.color || ''} - ${variant.size || ''}`.trim();
  await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      variant_id: variant.id,
      product_name: variant.products.name,
      variant_info: variantInfo,
      quantity,
      price_at_time: priceAtTime
    });

  // 6. Send Telegram Notification
  const msg = `<b>NOUVELLE COMMANDE</b> - ${orderTotal} DZD
Client: ${customerName} (${phone})
Livraison: ${wilaya} - ${commune} (${deliveryType === 'home' ? 'À domicile' : 'Stopdesk'})
Article: 1x ${variant.products.name} (${variantInfo})
Total: ${orderTotal} DZD`;

  await sendTelegramNotification(msg);

  // Redirect to success page
  redirect(`/merci?total=${orderTotal}`);
}


// ── Multi-item cart checkout ──────────────────────────
interface CartItemPayload {
  variantId: string;
  quantity: number;
  productName: string;
  variantInfo: string;
  priceAtTime: number;
}


export async function processCartCheckout(formData: FormData) {
  const supabase = await createAdminClient();

  const customerName = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const wilayaCode = formData.get('wilaya_code') as string;
  const wilayaName = formData.get('wilaya_name') as string;
  const commune = formData.get('commune') as string;
  const address = (formData.get('address') as string) || 'Bureau NOEST';
  const deliveryType = formData.get('delivery_type') as 'home' | 'office';
  const cartItemsJson = formData.get('cart_items') as string;

  if (!customerName || !phone || !wilayaCode || !cartItemsJson) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  let cartItems: CartItemPayload[];
  try {
    cartItems = JSON.parse(cartItemsJson);
  } catch {
    return { error: "Données du panier invalides." };
  }

  if (!cartItems.length) {
    return { error: "Le panier est vide." };
  }

  // 1. Verify stock for all items
  for (const item of cartItems) {
    const { data: variant } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', item.variantId)
      .single();

    if (!variant || variant.stock < item.quantity) {
      return { error: `Stock insuffisant pour "${item.productName}" (${item.variantInfo}). Disponible: ${variant?.stock || 0}` };
    }
  }

  // 2. Calculate totals
  const itemsTotal = cartItems.reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0);
  const deliveryCost = getDeliveryCost(wilayaCode, deliveryType);
  const orderTotal = itemsTotal + deliveryCost;

  // 3. Decrement stock for all items
  for (const item of cartItems) {
    const { data: currentVariant } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', item.variantId)
      .single();

    if (currentVariant) {
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock: currentVariant.stock - item.quantity })
        .eq('id', item.variantId)
        .gte('stock', item.quantity);

      if (updateError) {
        return { error: `Erreur stock pour "${item.productName}".` };
      }
    }
  }

  // 4. Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      phone,
      wilaya: wilayaName || wilayaCode,
      commune,
      address,
      delivery_type: deliveryType,
      items_total: itemsTotal,
      delivery_cost: deliveryCost,
      order_total: orderTotal,
      status: 'nouvelle'
    })
    .select()
    .single();

  if (orderError) {
    return { error: "Erreur lors de la création de la commande." };
  }

  // 5. Create Order Items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    variant_id: item.variantId,
    product_name: item.productName,
    variant_info: item.variantInfo,
    quantity: item.quantity,
    price_at_time: item.priceAtTime,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    return { error: "Erreur lors de l'enregistrement des articles." };
  }

  // 6. Send Telegram Notification
  const articlesList = cartItems.map(i => `- ${i.quantity}x ${i.productName} (${i.variantInfo})`).join('\n');
  const msg = `<b>NOUVELLE COMMANDE PANIER</b> - ${orderTotal} DZD
Client: ${customerName} (${phone})
Livraison: ${wilayaName || wilayaCode} - ${commune} (${deliveryType === 'home' ? 'À domicile' : 'Stopdesk'})
Articles:
${articlesList}
Total: ${orderTotal} DZD`;

  await sendTelegramNotification(msg);

  // Success!
  return { success: true, orderTotal };
}
