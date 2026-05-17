import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  sellerName: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const key = `${item.productId}-${item.size}-${item.color}`;
        const existing = items.find(
          (i) => `${i.productId}-${i.size}-${i.color}` === key
        );
        if (existing) {
          set({ items: items.map((i) =>
            `${i.productId}-${i.size}-${i.color}` === key
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          )});
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity ?? 1 }] });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) =>
        set({ items: quantity <= 0
          ? get().items.filter((i) => i.id !== id)
          : get().items.map((i) => i.id === id ? { ...i, quantity } : i)
        }),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'veyra-cart' }
  )
);
