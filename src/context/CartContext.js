import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useMemo,
} from "react";
import AppCalls from '../utils/network';
import { showToast } from "../utils/toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdated,setUpdated]=useState(null)

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AppCalls.get("/cart/");
      console.log(res?.data); 
      const data = res?.data?.cartItems || [];
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId,vendorId,quantity=1) => {
    try {
      const res = await AppCalls.post("/cart/", {
        productId,
        vendorId,
        quantity,
      });
      setItems(res.data.cartItems);
      showToast("success","Cart added!","You can try preceed to checkout.")
    } catch (error) {
      console.error(error)
      showToast("error",error.message||"Failed to add cart","Please try again.")
    } finally {
      setUpdated(true)
    }
  };

  const updateQty = async (productId, quantity) => {
    try {
      const res = await AppCalls.post("/cart/", { productId, quantity });
      console.log(res.data);
      setItems(res.data.cartItems);
      showToast("success", "Cart updated!", "You can try preceed to checkout.");
    } catch (error) {
      showToast(
        "error",
        error.message || "Failed to add cart",
        "Please try again.",
      );
    } finally {
      setUpdated(true);
    }
  };

  const removeFromCart = async (productId) => {
    const deleted = items;
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    try {
      const res = await AppCalls.remove("/cart/" + productId);
      console.log(res.data);
      showToast(
        "success",
        "Item removed!",
        "You can now add new items to your cart.",
      );
    } catch (error) {
      setItems(deleted);
      showToast(
        "error",
        error.message || "Failed to delete cart",
        "Please try again.",
      );
    } finally {
      setUpdated(true);
    }
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);
  const serviceFee = "***" // items.length > 0 ? 2000 : 0;
  const total = subtotal; // + serviceFee;

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, loadCart, subtotal, serviceFee, total, loading, error }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
