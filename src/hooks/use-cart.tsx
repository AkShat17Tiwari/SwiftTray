"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem } from "@/types";
import { toast } from "sonner";

interface CartState {
  items: CartItem[];
  outletId: string | null;
  outletName: string | null;
}

interface CartContextType {
  items: CartItem[];
  outletId: string | null;
  outletName: string | null;
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem, outletId: string, outletName: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (menuItemId: string) => boolean;
  getItemQuantity: (menuItemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "swifttray-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    outletId: null,
    outletName: null,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const addItem = useCallback(
    (item: CartItem, outletId: string, outletName: string) => {
      setCart((prev) => {
        // If cart has items from a different outlet, ask to clear
        if (prev.outletId && prev.outletId !== outletId && prev.items.length > 0) {
          const confirmed = window.confirm(
            `Your cart has items from ${prev.outletName}. Adding items from ${outletName} will clear your current cart. Continue?`
          );
          if (!confirmed) return prev;
          return {
            items: [item],
            outletId,
            outletName,
          };
        }

        // Check if item already exists
        const existingIndex = prev.items.findIndex(
          (i) => i.menuItemId === item.menuItemId
        );

        if (existingIndex >= 0) {
          const newItems = [...prev.items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + item.quantity,
          };
          return { ...prev, items: newItems, outletId, outletName };
        }

        return {
          items: [...prev.items, item],
          outletId,
          outletName,
        };
      });

      toast.success(`${item.name} added to cart!`, {
        description: `Quantity: ${item.quantity}`,
      });
    },
    []
  );

  const removeItem = useCallback((menuItemId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.menuItemId !== menuItemId);
      if (newItems.length === 0) {
        return { items: [], outletId: null, outletName: null };
      }
      return { ...prev, items: newItems };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      ),
    }));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setCart({ items: [], outletId: null, outletName: null });
  }, []);

  const isInCart = useCallback(
    (menuItemId: string) => cart.items.some((i) => i.menuItemId === menuItemId),
    [cart.items]
  );

  const getItemQuantity = useCallback(
    (menuItemId: string) => {
      const item = cart.items.find((i) => i.menuItemId === menuItemId);
      return item?.quantity ?? 0;
    },
    [cart.items]
  );

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, item) =>
      sum +
      (item.price + item.customizations.reduce((cs, c) => cs + c.price, 0)) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        outletId: cart.outletId,
        outletName: cart.outletName,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
