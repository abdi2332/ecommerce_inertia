import React, { createContext, useContext, useState, useEffect } from "react";
import { usePage } from '@inertiajs/react'
import echo from '../../echo'
import { Inertia, } from '@inertiajs/inertia';

const CartContext = createContext()

export function CartProvider({ children, initialCart, identifier,user }) {


  const [cart, setCart] = useState(initialCart || []);
  const [cartCount, setCartCount] = useState(
    initialCart ? initialCart.reduce((sum, item) => sum + item.qty, 0) : 0
  );

	 useEffect(() => {

    if (!identifier) return;

    console.log( `Listening to ${user?'private':'public'} channel: `, `cart.${identifier}`);
    
    // Use public channel() instead of private()
    const channel = user
      ? echo.private(`cart.${identifier}`)
      : echo.channel(`cart.${identifier}`);


    
    channel.listen('.CartUpdated', (event) => {
      
      setCart(event.cart); // Update cart with broadcasted data
    })
    .listen('.CartItemAdded', (event) => {
    
      console.log('Item added to cart via broadcast:', event);
 
      setCart(prev => [...prev, {
        id: event.product.id,
        name: event.product.name,
        price: event.product.price,
        qty: event.quantity,
      }])

      setCartCount(event.cart_count)
    })
   .listen('.CartItemUpdated', (event) => {
  setCart(prev => prev.map(item =>
      item.id == event.product_id  // use loose equality
          ? { ...item, qty: event.quantity }
          : item
  ));
  setCartCount(event.cart_count)
})
  .listen('.CartItemRemoved', (event) => {
    setCart(prev => prev.filter(item => item.id !== event.product_id));
    setCartCount(event.cart_count)
}).listen('.CartSynced', (e) => {
        console.log('Full cart synced:', e.cart)
      setCart(e.cart);
    });



    return () => {
      channel.stopListening('.CartUpdated');
      echo.leave(`cart.${identifier}`);
    };
  }, [identifier,user]);

  return (
	<CartContext.Provider value={{ cart, setCart,user, cartCount, }}>
	  {children}
	</CartContext.Provider>
  )

}

export function useCart() {

	  return useContext(CartContext)
}