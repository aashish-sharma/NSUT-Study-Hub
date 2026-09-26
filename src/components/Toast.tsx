import { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

export function Toast({ message, isOpen, onClose, type = "info" }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bgColors = {
    success: "bg-green-600 dark:bg-green-500 text-white",
    error: "bg-red-600 dark:bg-red-500 text-white",
    info: "bg-[var(--color-text)] text-[var(--color-bg)]",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div 
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-base)] shadow-lg max-w-[90vw] text-[var(--text-sm-fluid)] font-medium",
          bgColors[type]
        )}
        role="status"
        aria-live="polite"
      >
        <span>{message}</span>
        <button 
          onClick={onClose}
          aria-label="Dismiss message"
          className="p-1 -mr-1 rounded-[var(--radius-sm)] hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
