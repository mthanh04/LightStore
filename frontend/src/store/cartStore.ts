import { create } from 'zustand';
import { 
  getCartApi, syncCartApi, addToCartApi, updateCartItemApi, removeCartItemApi, clearCartApi 
} from '../services/cartService';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Computed
  totalItems: number;
  totalPrice: number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const LS_CART_KEY = 'ls_cart';

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(LS_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(LS_CART_KEY, JSON.stringify(items));
};

const calcTotalItems = (items: CartItem[]) =>
  items.reduce((acc, i) => acc + i.quantity, 0);

const calcTotalPrice = (items: CartItem[]) =>
  items.reduce((acc, i) => acc + i.price * i.quantity, 0);

const initialItems = loadCart();

export const useCartStore = create<CartState>((set, get) => ({
  items: initialItems,
  isDrawerOpen: false,
  totalItems: calcTotalItems(initialItems),
  totalPrice: calcTotalPrice(initialItems),

  fetchCart: async () => {
    const token = localStorage.getItem('ls_token');
    if (token) {
      try {
        const items = await getCartApi();
        saveCart(items); // Sync to local storage as fallback
        set({
          items,
          totalItems: calcTotalItems(items),
          totalPrice: calcTotalPrice(items)
        });
      } catch (err) {
        console.error('Failed to fetch cart', err);
      }
    }
  },

  syncCart: async () => {
    const token = localStorage.getItem('ls_token');
    if (token) {
      try {
        const localItems = loadCart().map(i => ({ _id: i._id, quantity: i.quantity }));
        const mergedItems = await syncCartApi(localItems);
        saveCart(mergedItems);
        set({
          items: mergedItems,
          totalItems: calcTotalItems(mergedItems),
          totalPrice: calcTotalPrice(mergedItems)
        });
      } catch (err) {
        console.error('Failed to sync cart', err);
      }
    }
  },

  addItem: async (newItem) => {
    const token = localStorage.getItem('ls_token');
    let updated: CartItem[];

    if (token) {
      try {
        updated = await addToCartApi(newItem._id, 1);
      } catch (error) {
        console.error(error);
        return;
      }
    } else {
      const items = get().items;
      const existing = items.find((i) => i._id === newItem._id);
      if (existing) {
        updated = items.map((i) =>
          i._id === newItem._id
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      } else {
        updated = [...items, { ...newItem, quantity: 1 }];
      }
    }

    saveCart(updated);
    set({
      items: updated,
      totalItems: calcTotalItems(updated),
      totalPrice: calcTotalPrice(updated),
      isDrawerOpen: true,
    });
  },

  removeItem: async (id) => {
    const token = localStorage.getItem('ls_token');
    let updated: CartItem[];

    if (token) {
      try {
        updated = await removeCartItemApi(id);
      } catch (error) {
        console.error(error);
        return;
      }
    } else {
      updated = get().items.filter((i) => i._id !== id);
    }

    saveCart(updated);
    set({
      items: updated,
      totalItems: calcTotalItems(updated),
      totalPrice: calcTotalPrice(updated),
    });
  },

  updateQty: async (id, qty) => {
    const token = localStorage.getItem('ls_token');
    let updated: CartItem[];

    if (token) {
      try {
        updated = await updateCartItemApi(id, qty);
      } catch (error) {
        console.error(error);
        return;
      }
    } else {
      updated = get().items.map((i) =>
        i._id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i
      );
    }

    saveCart(updated);
    set({
      items: updated,
      totalItems: calcTotalItems(updated),
      totalPrice: calcTotalPrice(updated),
    });
  },

  clearCart: async () => {
    const token = localStorage.getItem('ls_token');
    if (token) {
      try {
        await clearCartApi();
      } catch (error) {
        console.error(error);
      }
    }
    
    // We do NOT clear localStorage when token exists to preserve it on logout,
    // wait, if the user specifically clicked "clear cart" or checked out, we should clear it.
    localStorage.removeItem(LS_CART_KEY);
    set({ items: [], totalItems: 0, totalPrice: 0 });
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));
