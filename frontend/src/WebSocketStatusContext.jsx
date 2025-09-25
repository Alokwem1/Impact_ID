import { createContext, useContext, useState, useCallback } from "react";

// Context exposing current websocket connection status and a setter for internal publisher
const WebSocketStatusContext = createContext(null);

export function WebSocketStatusProvider({ children }) {
  const [status, setStatus] = useState("disconnected");
  const update = useCallback((s) => setStatus(s), []);
  return (
    <WebSocketStatusContext.Provider value={{ status, _update: update }}>
      {children}
    </WebSocketStatusContext.Provider>
  );
}

export function useWebSocketStatus() {
  const ctx = useContext(WebSocketStatusContext);
  if (!ctx)
    throw new Error(
      "useWebSocketStatus must be used within WebSocketStatusProvider",
    );
  return ctx.status;
}

// Internal hook for manager to publish updates
export function useWebSocketStatusPublisher() {
  const ctx = useContext(WebSocketStatusContext);
  if (!ctx)
    throw new Error(
      "useWebSocketStatusPublisher must be used within WebSocketStatusProvider",
    );
  return ctx._update;
}
