"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: string; message: string; tone?: "default" | "success" | "error" };

const ToastContext = createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = `t_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setToasts((s) => [...s, { id, ...t }]);
    // auto remove
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone === 'success' ? 'success' : t.tone === 'error' ? 'error' : ''}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
