import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={20} strokeWidth={1.75} className="text-[var(--color-muted)]" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-3 border border-[var(--color-border)] rounded-[var(--radius-base)] bg-[var(--color-surface)] text-[var(--text-base-fluid)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
        placeholder="Search subjects..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search subjects"
      />
    </div>
  );
}
