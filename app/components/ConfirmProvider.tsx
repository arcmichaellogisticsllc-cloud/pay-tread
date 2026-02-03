"use client";

import React, { createContext, useCallback, useContext, useState } from 'react';

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = {
  confirm: (message: string | ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const [message, setMessage] = useState('');
  const [resolver, setResolver] = useState<((r: boolean) => void) | null>(null);

  const confirm = useCallback((m: string | ConfirmOptions) => {
    const o: ConfirmOptions = typeof m === 'string' ? { description: m } : m;
    setOpts(o);
    setMessage(o.description ?? 'Are you sure?');
    setOpen(true);
    return new Promise<boolean>((res) => {
      setResolver(() => res);
    });
  }, []);

  const doClose = (result: boolean) => {
    setOpen(false);
    if (resolver) resolver(result);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {open ? (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => doClose(false)} />
          <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 320, boxShadow: '0 6px 20px rgba(0,0,0,0.12)', zIndex: 10000 }}>
            {opts.title ? <h3 style={{ marginTop: 0 }}>{opts.title}</h3> : null}
            <div style={{ margin: '8px 0 16px' }}>{message}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => doClose(false)}>{opts.cancelText ?? 'Cancel'}</button>
              <button onClick={() => doClose(true)} style={{ background: '#111', color: 'white', padding: '6px 12px', borderRadius: 4 }}>{opts.confirmText ?? 'OK'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
};

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx.confirm;
}

export default ConfirmProvider;
