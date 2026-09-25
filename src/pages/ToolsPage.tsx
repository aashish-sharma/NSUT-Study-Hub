import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ToolRow } from "../components/ToolRow";
import "./tools.css";

const TOOLS = [
  {
    to: "/tools/cgpa",
    title: "CGPA Calculator",
    description: "Calculate your cumulative GPA from credits and grades.",
  },
  {
    to: "/tools/sgpa",
    title: "SGPA Tracker",
    description: "Save semester-wise GPAs and track your running CGPA.",
  },
  {
    to: "/tools/attendance",
    title: "Attendance Calculator",
    description: "Check if you can bunk or how many classes you need.",
  },
] as const;

export function ToolsPage() {
  useEffect(() => {
    document.title = "Study Hub | Tools";
  }, []);

  return (
    <main id="main-content" className="max-w-[1120px] mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/subjects"
        className="inline-flex items-center gap-1 text-[var(--color-muted)] text-[var(--text-sm-fluid)] font-medium mb-6 min-h-[44px] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back to subjects
      </Link>

      <h1 className="text-[var(--text-xl-fluid)] font-semibold text-[var(--color-text)] mb-2">
        Tools
      </h1>
      <p className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] mb-6">
        {TOOLS.length} tools
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map((tool) => (
          <ToolRow key={tool.to} {...tool} />
        ))}
      </div>
    </main>
  );
}
