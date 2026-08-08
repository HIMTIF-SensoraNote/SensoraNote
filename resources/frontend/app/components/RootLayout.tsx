import { Outlet } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { BookmarkProvider } from '../contexts/BookmarkContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';

export function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookmarkProvider>
            <ToastProvider>
              <Outlet />
            </ToastProvider>
          </BookmarkProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

