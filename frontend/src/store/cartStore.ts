import { create } from 'zustand';

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
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
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

  addItem: (newItem) => {
    const items = get().items;
    const existing = items.find((i) => i._id === newItem._id);
    let updated: CartItem[];

    if (existing) {
      // Tăng số lượng, không vượt quá stock
      updated = items.map((i) =>
        i._id === newItem._id
          ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
          : i
      );
    } else {
      updated = [...items, { ...newItem, quantity: 1 }];
    }

    saveCart(updated);
    set({
      items: updated,
      totalItems: calcTotalItems(updated),
      totalPrice: calcTotalPrice(updated),
      isDrawerOpen: true,
    });
  },

  removeItem: (id) => {
    const updated = get().items.filter((i) => i._id !== id);
    saveCart(updated);
    set({
      items: updated,
      totalItems: calcTotalItems(updated),
      totalPrice: calcTotalPrice(updated),
    });
  },

  updateQty: (id, qty) => {
    const updated = get().items.map((i) =>
      i._id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i
    );
    saveCart(updated);
    set({
      items: updated,
      totalItems: calcTotalItems(updated),
      totalPrice: calcTotalPrice(updated),
    });
  },

  clearCart: () => {
    localStorage.removeItem(LS_CART_KEY);
    set({ items: [], totalItems: 0, totalPrice: 0 });
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));
