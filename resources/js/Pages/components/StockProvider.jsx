// StockProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import echo from '../../echo';

const StockContext = createContext();

export function StockProvider({ children }) {
  const [stockMap, setStockMap] = useState({}); // { productId: stock }

  useEffect(() => {
    const stockChannel = echo.channel("Stock");

    stockChannel.listen(".StockUpdated", (event) => {
      console.log("Centralized Stock update:", event);
      setStockMap((prev) => ({
        ...prev,
        [event.productId]: event.newstock,
      }));
    });

    return () => {
      stockChannel.stopListening(".StockUpdated");
    };	return React.useContext(CartContext)
  }, []);

  return (
    <StockContext.Provider value={stockMap}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock(productId, initialStock) {
  const stockMap = useContext(StockContext);
  return stockMap[productId] ?? initialStock;
}
