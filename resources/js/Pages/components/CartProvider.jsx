import React, { createContext, useContext, useState, useEffect } from "react";
import { usePage } from '@inertiajs/react'
import echo from '../../echo'

const CartContext = createContext()

export function CartProvider({ children, initialCart, sessionId }) {
  const [cart, setCart] = useState(initialCart || []);

	 useEffect(() => {
    if (!sessionId) return;

    console.log('Listening to public channel:', `cart.${sessionId}`);
    
    // Use public channel() instead of private()
    const channel = echo.channel(`cart.${sessionId}`);
    
    channel.listen('.CartUpdated', (event) => {
      
      setCart(event.cart); // Update cart with broadcasted data
    })
    .listen('.CartItemAdded', (event) => {
 
      setCart(prev => [...prev, {
        id: event.product.id,
        name: event.product.name,
        price: event.product.price,
        qty: event.quantity,
      }])
    })
   .listen('.CartItemUpdated', (event) => {
  setCart(prev => prev.map(item =>
      item.id == event.product_id  // use loose equality
          ? { ...item, qty: event.quantity }
          : item
  ));
})
  .listen('.CartItemRemoved', (event) => {

 
    setCart(prev => prev.filter(item => item.id !== event.product_id));
})



    return () => {
      channel.stopListening('.CartUpdated');
      echo.leave(`cart.${sessionId}`);
    };
  }, [sessionId]);

  return (
	<CartContext.Provider value={{ cart, setCart }}>
	  {children}
	</CartContext.Provider>
  )

}

export function useCart() {

	  return useContext(CartContext)
}