import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  computeAttendance,
  validateAttendance,
  classesUntilTarget,
} from "../lib/attendance";
import { toolsStorage } from "../lib/toolsStorage";
import type { AttendanceLastData } from "../lib/toolsStorage";
import { runFormulaChecks } from "../lib/devChecks";
import "./tools.css";

const DEFAULTS: AttendanceLastData = {
  held: 0,
  attended: 0,
  required: 75,
  target: 80,
};

export function AttendancePage() {
  const [state, setState] = useState<AttendanceLastData>(() => {
    const saved = toolsStorage.readAttendanceLast();
    return saved ?? DEFAULTS;
  });

  // Dev-only regression checks
  useEffect(() => {
    runFormulaChecks();
  }, []);

  useEffect(() => {
    document.title = "Study Hub | Attendance Calculator";
  }, []);

  // Persist on change
  const update = useCallback(
    (patch: Partial<AttendanceLastData>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        toolsStorage.writeAttendanceLast(next);
        return next;
      });
    },
    [],
  );

  // Validation
  const validationErrors = useMemo(
    () =>
      validateAttendance({
        held: state.held,
        attended: state.attended,
        required: state.required,
      }),
    [state.held, state.attended, state.required],
  );

  const attendedGtHeld = validationErrors.some(
    (e) => e.field === "attended" && state.attended > 0 && state.held > 0,
  );

  // Main attendance result
  const result = useMemo(() => {
    if (validationErrors.length > 0 || state.held <= 0) return null;
    return computeAttendance({
      held: state.held,
      attended: state.attended,
      required: state.required,
    });
  }, [state.held, state.attended, state.required, validationErrors]);

  // Classes-until-target result
  const targetResult = useMemo(() => {
    if (state.held <= 0 || state.attended < 0 || state.attended > state.held)
      return null;
    return classesUntilTarget(state.held, state.attended, state.target);
  }, [state.held, state.attended, state.target]);

  // Format the "can I bunk" message
  const renderBunkMessage = () => {
    if (!result) return null;

    if (result.isAbove) {
      if (result.canMiss === 0) {
        return (
          <p className="text-[var(--color-text)] font-medium">
            You're at exactly {state.required}%. You cannot miss any more classes.
          </p>
        );
      }
      return (
        <p className="text-[var(--color-text)] font-medium">
          ✓ You can miss{" "}
          <strong>{result.canMiss}</strong>{" "}
          more {result.canMiss === 1 ? "class" : "classes"} and stay
          at {state.required}%.
        </p>
      );
    } else {
      if (result.mustAttend === Infinity) {
        return (
          <p className="text-[var(--color-badge-imp)] font-medium">
            You cannot reach {state.required}% — you've already missed classes.
          </p>
        );
      }
      return (
        <p className="text-[var(--color-badge-imp)] font-medium">
          You need to attend the next{" "}
          <strong>{result.mustAttend}</strong>{" "}
          {result.mustAttend === 1 ? "class" : "classes"} in a row to reach{" "}
          {state.required}%.
        </p>
      );
    }
  };

  // Format the "classes until target" message
  const renderTargetMessage = () => {
    if (targetResult === null) return null;
    if (targetResult === 0) {
      return (
        <p className="text-[var(--color-text)] font-medium">
          ✓ You're already at or above {state.target}%.
        </p>
      );
    }
    if (targetResult === Infinity) {
      return (
        <p className="text-[var(--color-badge-imp)] font-medium">
          Impossible — you can't reach {state.target}% once you've missed
          classes.
        </p>
      );
    }
    return (
      <p className="text-[var(--color-text)] font-medium">
        You need to attend <strong>{targetResult}</strong> more{" "}
        {targetResult === 1 ? "class" : "classes"} to reach {state.target}%.
      </p>
    );
  };

  return (
    <main id="main-content" className="max-w-[700px] mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-[var(--color-muted)] text-[var(--text-sm-fluid)] font-medium mb-6 min-h-[44px] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back to tools
      </Link>

      <h1 className="text-[var(--text-xl-fluid)] font-semibold text-[var(--color-text)] mb-6">
        Attendance Calculator
      </h1>

      {/* Shared inputs: held + attended */}
      <div className="flex flex-wrap gap-4 mb-2">
        <div className="flex-1 min-w-[140px]">
          <label
            htmlFor="att-held"
            className="block text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] mb-1"
          >
            Classes held
          </label>
          <input
            id="att-held"
            type="number"
            className="tools-input"
            inputMode="numeric"
            min={0}
            value={state.held || ""}
            onChange={(e) => update({ held: Number(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label
            htmlFor="att-attended"
            className="block text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] mb-1"
          >
            Classes attended
          </label>
          <input
            id="att-attended"
            type="number"
            className="tools-input"
            inputMode="numeric"
            min={0}
            value={state.attended || ""}
            onChange={(e) => update({ attended: Number(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      {/* Validation error */}
      {attendedGtHeld && (
        <p className="text-[var(--color-badge-imp)] text-[var(--text-sm-fluid)] mb-2 px-1">
          Classes attended cannot exceed classes held.
        </p>
      )}

      {/* ─── Section A: Can I bunk? ─── */}
      <hr className="tools-divider" />
      <h2 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] mb-4">
        Can I bunk?
      </h2>

      <div className="max-w-[200px] mb-4">
        <label
          htmlFor="att-required"
          className="block text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] mb-1"
        >
          Required %
        </label>
        <input
          id="att-required"
          type="number"
          className="tools-input"
          inputMode="decimal"
          min={0}
          max={100}
          value={state.required || ""}
          onChange={(e) => update({ required: Number(e.target.value) || 0 })}
          placeholder="75"
        />
      </div>

      <div className="tools-result">
        {result ? (
          <div className="flex flex-col gap-2">
            <p className="text-[var(--color-muted)]">
              Current attendance:{" "}
              <span className="text-[var(--text-xl-fluid)] font-semibold text-[var(--color-text)]">
                {result.currentPercent.toFixed(1)}%
              </span>
            </p>
            {renderBunkMessage()}
          </div>
        ) : (
          <span className="text-[var(--color-muted)]">
            {state.held <= 0
              ? "Enter the number of classes held to calculate."
              : attendedGtHeld
                ? "Fix the inputs above to calculate."
                : "Enter valid numbers to calculate."}
          </span>
        )}
      </div>

      {/* ─── Section B: How many classes until X%? ─── */}
      <hr className="tools-divider" />
      <h2 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] mb-4">
        How many classes until I hit X%?
      </h2>

      <div className="max-w-[200px] mb-4">
        <label
          htmlFor="att-target"
          className="block text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] mb-1"
        >
          Target %
        </label>
        <input
          id="att-target"
          type="number"
          className="tools-input"
          inputMode="decimal"
          min={0}
          max={100}
          value={state.target || ""}
          onChange={(e) => update({ target: Number(e.target.value) || 0 })}
          placeholder="80"
        />
      </div>

      <div className="tools-result">
        {state.held > 0 && !attendedGtHeld ? (
          renderTargetMessage()
        ) : (
          <span className="text-[var(--color-muted)]">
            {state.held <= 0
              ? "Enter the number of classes held above."
              : "Fix the inputs above to calculate."}
          </span>
        )}
      </div>
    </main>
  );
}
