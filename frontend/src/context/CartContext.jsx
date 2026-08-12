import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "buysmart_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, qty: Math.min(i.qty + qty, product.countInStock) }
            : i
        );
      }
      const price =
        product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.image,
          price,
          countInStock: product.countInStock,
          qty,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const itemsCount = useMemo(() => items.reduce((acc, i) => acc + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.qty * i.price, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQty, removeFromCart, clearCart, itemsCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
