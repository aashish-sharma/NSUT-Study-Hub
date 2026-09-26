import { Analytics } from '@vercel/analytics/react';
import { Routes, Route, useLocation } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { SubjectPage } from "./pages/SubjectPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ToolsPage } from "./pages/ToolsPage";
import { CgpaPage } from "./pages/CgpaPage";
import { SgpaPage } from "./pages/SgpaPage";
import { AttendancePage } from "./pages/AttendancePage";
import { ExamsPage } from "./pages/ExamsPage";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SkipToContent } from "./components/SkipToContent";
import { useScrollToTop } from "./hooks/useScrollToTop";

function AppContent() {
  useScrollToTop();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <SkipToContent />
      {!isLanding && <Header />}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subject/:id" element={<SubjectPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/cgpa" element={<CgpaPage />} />
          <Route path="/tools/sgpa" element={<SgpaPage />} />
          <Route path="/tools/attendance" element={<AttendancePage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      {!isLanding && <Footer />}
    </div>
  );
}

function App() {
  return <AppContent />;
  return <Analytics />;
}

export default App;
