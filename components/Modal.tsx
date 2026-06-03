"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ title, open, onClose, children, size = "md" }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} glass-card rounded-2xl shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-display text-lg text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
