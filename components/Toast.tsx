"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let addToastFn: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(type: ToastType, message: string) {
  addToastFn?.({ type, message });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = ({ type, message }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => { addToastFn = null; };
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <AlertCircle className="w-5 h-5 text-blue-400" />,
  };

  const colors = {
    success: "border-emerald-500/30 bg-emerald-950/80",
    error: "border-red-500/30 bg-red-950/80",
    info: "border-blue-500/30 bg-blue-950/80",
  };

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl animate-slide-down ${colors[t.type]}`}
        >
          {icons[t.type]}
          <span className="text-sm text-white font-medium">{t.message}</span>
          <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
            <X className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
