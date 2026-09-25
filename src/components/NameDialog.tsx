import { useEffect, useRef, useState } from "react";
import { storage } from "../lib/storage";

interface NameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function NameDialog({ isOpen, onClose, onSaved }: NameDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose(); // Stay on landing page without saving
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    
    if (trimmed.length < 1 || trimmed.length > 30) {
      setError("Name must be between 1 and 30 characters.");
      return;
    }

    if (!/^[\p{L}\s\-'.]+$/u.test(trimmed)) {
      setError("Name can only contain letters, spaces, hyphens, apostrophes, and dots.");
      return;
    }

    storage.updateUser(trimmed);
    onSaved();
  };

  const handleSkip = () => {
    storage.updateUser(null);
    onSaved();
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] p-6 shadow-xl max-w-sm w-full mx-auto outline-none open:flex flex-col m-auto"
      aria-labelledby="dialog-title"
    >
      <h2 id="dialog-title" className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] mb-4">
        What should we call you?
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="firstName" className="sr-only">First Name</label>
        <input
          id="firstName"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-base)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] mb-2"
          placeholder="First name"
          autoFocus
        />
        {error && <p className="text-[var(--color-badge-imp)] text-[var(--text-sm-fluid)] mb-4">{error}</p>}
        {!error && <div className="h-4 mb-4"></div>}
        
        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors text-[var(--text-sm-fluid)] font-medium"
          >
            Skip
          </button>
          <button
            type="submit"
            className="l-btn px-4 py-2"
          >
            <span className="l-btn__label">Continue</span>
          </button>
        </div>
      </form>
    </dialog>
  );
}
