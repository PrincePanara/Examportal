import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ExamSessionProvider } from './contexts/ExamSessionContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AdminShell } from './components/admin/AdminShell';
import { Landing } from './pages/Landing';
import { StudentLogin } from './pages/StudentLogin';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/admin/Dashboard';
import { Exams } from './pages/admin/Exams';
import { ExamBuilder } from './pages/admin/ExamBuilder';
import { QuestionBankPage } from './pages/admin/QuestionBankPage';
import { Users } from './pages/admin/Users';
import { Results } from './pages/admin/Results';
import { Analytics } from './pages/admin/Analytics';
import { ExamAnalytics } from './pages/admin/ExamAnalytics';
import { Settings } from './pages/admin/Settings';
import { ExamPortal } from './pages/exam/ExamPortal';
import { StudentPreview } from './pages/admin/StudentPreview';
import { NotFound } from './pages/NotFound';
import { setFlakyNetwork } from './services/examApi';

interface AppProps {
  /** Coordinated light/dark treatment for the whole platform. */
  theme?: 'light' | 'dark';
  /** Exercises the offline / retry / reconnected auto-save states in the exam runner. */
  simulateFlakyNetwork?: boolean;
}

function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      gap={10}
      toastOptions={{
        style: {
          borderRadius: '10px',
          border: '1px solid rgb(var(--line))',
          background: 'rgb(var(--surface))',
          color: 'rgb(var(--ink))',
          fontSize: '13px'
        }
      }} />);
}

/** Guard: requires admin to be logged in */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, authLoading } = useAuth();
  // Show spinner while Firebase auth state resolves
  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
    </div>
  );
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

/** Guard: requires student Google auth */
function StudentGuard({ children }: { children: React.ReactNode }) {
  const { isStudentAuthenticated, authLoading } = useAuth();
  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
    </div>
  );
  if (!isStudentAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App({ theme = 'light', simulateFlakyNetwork = false }: AppProps) {
  useEffect(() => {
    setFlakyNetwork(simulateFlakyNetwork);
  }, [simulateFlakyNetwork]);

  return (
    <ThemeProvider initialTheme={theme}>
      <AuthProvider>
        <DataProvider>
          <ExamSessionProvider>
            <BrowserRouter>
              <AppToaster />
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<StudentLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Student (requires Google auth) */}
                <Route
                  path="/dashboard"
                  element={
                    <StudentGuard>
                      <StudentDashboard />
                    </StudentGuard>
                  }
                />
                <Route
                  path="/exam"
                  element={
                    <StudentGuard>
                      <ExamPortal />
                    </StudentGuard>
                  }
                />

                {/* Admin (requires admin login) */}
                <Route path="/admin/preview/:examId" element={<StudentPreview />} />
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminShell />
                    </AdminGuard>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="exams" element={<Exams />} />
                  <Route path="exams/:examId" element={<ExamBuilder />} />
                  <Route path="questions" element={<QuestionBankPage />} />
                  <Route path="users" element={<Users />} />
                  <Route path="results" element={<Results />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="exam-analytics" element={<ExamAnalytics />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* 404 */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </ExamSessionProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}