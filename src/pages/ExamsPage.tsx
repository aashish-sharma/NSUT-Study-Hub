import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { ArrowLeft, Pencil, Trash2, CalendarPlus, X, Check } from "lucide-react";
import { loadSubjects } from "../data/loader";
import {
  readExams,
  addExam,
  updateExam,
  deleteExam,
  EXAM_TYPES,
  type Exam,
  type ExamType,
} from "../lib/storage";
import { daysUntil, daysUntilLabel, todayDateStr } from "../lib/dates";
import { downloadIcs } from "../lib/ics";
import "./tools.css";

export function ExamsPage() {
  const subjects = useMemo(() => {
    try {
      return loadSubjects().sort((a, b) => a.index_no - b.index_no);
    } catch {
      return [];
    }
  }, []);

  const [exams, setExams] = useState<Exam[]>(() => readExams(subjects));

  // Re-read on storage update (e.g. from another tab)
  useEffect(() => {
    const handleUpdate = () => setExams(readExams(subjects));
    window.addEventListener("studyhub:storage-update", handleUpdate);
    return () => window.removeEventListener("studyhub:storage-update", handleUpdate);
  }, [subjects]);

  useEffect(() => {
    document.title = "Study Hub | Exams";
  }, []);

  // --- Form state ---
  const [formSubjectId, setFormSubjectId] = useState<string>("");
  const [formType, setFormType] = useState<ExamType>("CT");
  const [formLabel, setFormLabel] = useState("");
  const [formDate, setFormDate] = useState("");

  // --- Edit state ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editSubjectId, setEditSubjectId] = useState<string>("");
  const [editType, setEditType] = useState<ExamType>("CT");

  const today = todayDateStr();

  const getDefaultLabel = useCallback(
    (subjectId: string, type: ExamType) => {
      const subjectName = subjects.find((s) => s.id === subjectId)?.name;
      return subjectName ? `${subjectName} ${type}` : type;
    },
    [subjects]
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate) return;

    const subjectId = formSubjectId || null;
    const label =
      formLabel.trim() ||
      getDefaultLabel(formSubjectId, formType);

    const exam: Exam = {
      id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subjectId,
      type: formType,
      label,
      date: formDate,
    };

    const next = addExam(exam, exams);
    setExams(next);

    // Reset form
    setFormSubjectId("");
    setFormType("CT");
    setFormLabel("");
    setFormDate("");
  };

  const startEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setEditLabel(exam.label);
    setEditDate(exam.date);
    setEditSubjectId(exam.subjectId ?? "");
    setEditType(exam.type);
  };

  const saveEdit = (examId: string) => {
    const original = exams.find((e) => e.id === examId);
    if (!original) return;

    const subjectId = editSubjectId || null;
    const label =
      editLabel.trim() ||
      getDefaultLabel(editSubjectId, editType);

    const updated: Exam = {
      ...original,
      subjectId,
      type: editType,
      label,
      date: editDate,
    };
    const next = updateExam(updated, exams);
    setExams(next);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const next = deleteExam(id, exams);
    setExams(next);
  };

  // Sort upcoming exams soonest first
  const sortedExams = useMemo(
    () =>
      [...exams]
        .filter((e) => daysUntil(e.date) >= 0)
        .sort((a, b) => daysUntil(a.date) - daysUntil(b.date)),
    [exams]
  );

  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return null;
    return subjects.find((s) => s.id === subjectId)?.name ?? null;
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

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
        Exams
      </h1>
      <p className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] mb-6">
        Track your upcoming exams and export them to your calendar.
      </p>

      {/* Add exam form */}
      <form
        onSubmit={handleAdd}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] p-4 mb-8"
      >
        <p className="text-[var(--color-text)] font-medium text-[var(--text-base-fluid)] mb-4">
          Add exam
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Subject */}
          <div>
            <label
              htmlFor="exam-subject"
              className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1"
            >
              Subject
            </label>
            <select
              id="exam-subject"
              className="tools-select"
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="exam-type"
              className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1"
            >
              Type
            </label>
            <select
              id="exam-type"
              className="tools-select"
              value={formType}
              onChange={(e) => setFormType(e.target.value as ExamType)}
            >
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Label */}
          <div>
            <label
              htmlFor="exam-label"
              className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1"
            >
              Label{" "}
              <span className="text-[var(--text-xs-fluid)]">(optional)</span>
            </label>
            <input
              id="exam-label"
              type="text"
              className="tools-input"
              placeholder={getDefaultLabel(formSubjectId, formType)}
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="exam-date"
              className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1"
            >
              Date
            </label>
            <input
              id="exam-date"
              type="date"
              className="tools-input"
              min={today}
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="tools-btn tools-btn-primary">
          Add exam
        </button>
      </form>

      {/* Exam list */}
      {sortedExams.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-muted)]">
          No exams added yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedExams.map((exam) => {
            const isEditing = editingId === exam.id;
            const subjectName = getSubjectName(exam.subjectId);

            if (isEditing) {
              return (
                <div
                  key={exam.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-accent)]/30 rounded-[var(--radius-base)] p-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1">
                        Subject
                      </label>
                      <select
                        className="tools-select"
                        value={editSubjectId}
                        onChange={(e) => setEditSubjectId(e.target.value)}
                      >
                        <option value="">No subject</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1">
                        Type
                      </label>
                      <select
                        className="tools-select"
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as ExamType)}
                      >
                        {EXAM_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        className="tools-input"
                        placeholder={getDefaultLabel(editSubjectId, editType)}
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-sm-fluid)] text-[var(--color-muted)] mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        className="tools-input"
                        min={today}
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="tools-btn tools-btn-primary"
                      onClick={() => saveEdit(exam.id)}
                    >
                      <Check size={16} />
                      Save
                    </button>
                    <button
                      type="button"
                      className="tools-btn tools-btn-outline"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={exam.id}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)]"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--color-text)] text-[var(--text-base-fluid)] leading-tight truncate">
                    {exam.label}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {subjectName && (
                      <span className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] leading-tight">
                        {subjectName}
                      </span>
                    )}
                    <span className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] leading-tight">
                      {formatDate(exam.date)}
                    </span>
                  </div>
                </div>

                {/* Days until badge */}
                <span className="text-[var(--text-sm-fluid)] font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-[var(--radius-full)] whitespace-nowrap shrink-0">
                  {daysUntilLabel(exam.date)}
                </span>

                {/* Actions */}
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    className="tools-btn-icon"
                    aria-label={`Add ${exam.label} to calendar`}
                    onClick={() => downloadIcs(exam)}
                    title="Add to calendar"
                  >
                    <CalendarPlus size={18} />
                  </button>
                  <button
                    type="button"
                    className="tools-btn-icon"
                    aria-label={`Edit ${exam.label}`}
                    onClick={() => startEdit(exam)}
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    className="tools-btn-icon"
                    aria-label={`Delete ${exam.label}`}
                    onClick={() => handleDelete(exam.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
