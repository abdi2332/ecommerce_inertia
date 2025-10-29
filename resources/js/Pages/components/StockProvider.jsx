// StockProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import echo from '../../echo';
import axios from "axios";

const StockContext = createContext();

export function StockProvider({ children }) {
  const [stockMap, setStockMap] = useState({}); // { productId: stock }

  useEffect(() => {
    axios.get("/stock/pending")
      .then(response => {
        const updates = response.data || [];
        setStockMap(prev => {
          const updated = { ...prev };
          updates.forEach(u => {
            updated[u.product_id] = u.new_stock;
          });
          return updated;
        });
      })
      .catch(() => {});


    const stockChannel = echo.channel("Stock");
    stockChannel.listen(".StockUpdated", (event) => {

      console.log("StockUpdated event received:", event);
      setStockMap(prev => {
        const updated = { ...prev };
        event.updates.forEach(u => {
          updated[u.product_id] = u.new_stock;
        });
        return updated;
      });
    });

    return () => {
      stockChannel.stopListening(".StockUpdated");
    };	
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
