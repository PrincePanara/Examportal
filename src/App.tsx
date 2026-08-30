import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ExamSessionProvider } from './contexts/ExamSessionContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AdminShell } from './components/admin/AdminShell';
import { Landing } from './pages/Landing';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/admin/Dashboard';
import { Exams } from './pages/admin/Exams';
import { ExamBuilder } from './pages/admin/ExamBuilder';
import { QuestionBankPage } from './pages/admin/QuestionBankPage';
import { Users } from './pages/admin/Users';
import { Results } from './pages/admin/Results';
import { Analytics } from './pages/admin/Analytics';
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
                <Route path="/" element={<Landing />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/preview/:examId" element={<StudentPreview />} />
                <Route path="/admin" element={<AdminShell />}>
                  <Route index element={<Dashboard />} />
                  <Route path="exams" element={<Exams />} />
                  <Route path="exams/:examId" element={<ExamBuilder />} />
                  <Route path="questions" element={<QuestionBankPage />} />
                  <Route path="users" element={<Users />} />
                  <Route path="results" element={<Results />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="/exam" element={<ExamPortal />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </ExamSessionProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>);

}