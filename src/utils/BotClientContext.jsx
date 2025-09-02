// BotClientContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import getUserModel from "../api/getUserModel";

const BotClientContext = createContext(null);

export function BotClientProvider({ children }) {
  const [botClient, setBotClient] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const user = await getUserModel(); // <-- declare const
        if (mountedRef.current) setBotClient(user);
      } catch (err) {
        console.error("Failed to load user", err);
        if (mountedRef.current) setBotClient({ is_verified: false }); // safe fallback
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const value = { botClient, setBotClient };
  return (
    <BotClientContext.Provider value={value}>
      {children}
    </BotClientContext.Provider>
  );
}

// Safer hook: helpful error if used outside Provider
export function useBotClient() {
  const ctx = useContext(BotClientContext);
  if (ctx === null) {
    throw new Error("useBotClient must be used within a BotClientProvider");
  }
  return ctx;
}
