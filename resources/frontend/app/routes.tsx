import { createBrowserRouter } from 'react-router';
import { Suspense, lazy, LazyExoticComponent, ComponentType } from 'react';
import { RootLayout } from './components/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- Eager (critical path / first paint): keep these in the main bundle ---
import { LandingPage } from './pages/landing-page';
import LoginPage from './pages/Login';
import NotFound from './pages/NotFound';

// --- Lazy (code-split into their own chunks, downloaded on demand) ---
// Heavy-dependency pages especially benefit: charts (recharts), editor (react-quill),
// pdf (jspdf), math (katex), spreadsheet (xlsx), image crop (react-easy-crop).
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyResultPage = lazy(() => import('./pages/auth/VerifyResultPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const PublicExplorePage = lazy(() => import('./pages/PublicExplorePage'));
const NoteDetailPage = lazy(() => import('./pages/NoteDetailPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const CommunityGuidelinesPage = lazy(() => import('./pages/CommunityGuidelinesPage'));
const DownloadAppPage = lazy(() => import('./pages/DownloadAppPage'));

const HomePage = lazy(() => import('./pages/HomePage'));
const CompleteProfilePage = lazy(() => import('./pages/CompleteProfilePage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/verify-email'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const NotificationDetailPage = lazy(() => import('./pages/NotificationDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const PrivacySettingsPage = lazy(() => import('./pages/PrivacySettingsPage'));
const ThemePage = lazy(() => import('./pages/ThemePage'));
const FollowRequestsPage = lazy(() => import('./pages/FollowRequestsPage'));
const LanguagePage = lazy(() => import('./pages/LanguagePage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const PakarDashboard = lazy(() => import('./pages/PakarDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LearningStatisticsPage = lazy(() => import('./pages/LearningStatisticsPage'));

// Page-level fallback shown while a route chunk downloads (theme-aware).
function PageFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// Wrap a lazy component in a Suspense boundary so the fallback shows during load.
const s = (Comp: LazyExoticComponent<ComponentType<any>>) => (
  <Suspense fallback={<PageFallback />}>
    <Comp />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'reset-password/:token',
        element: s(ResetPasswordPage),
      },
      {
        path: 'verify-success',
        element: s(VerifyResultPage),
      },
      {
        path: 'verify-failed',
        element: s(VerifyResultPage),
      },
      {
        path: 'explore',
        element: s(ExplorePage),
      },
      {
        path: 'katalog',
        element: s(PublicExplorePage),
      },
      {
        path: 'note/:id',
        element: s(NoteDetailPage),
      },
      {
        path: 'profile/:id',
        element: s(PublicProfilePage),
      },
      {
        path: 'terms',
        element: s(TermsPage),
      },
      {
        path: 'privacy',
        element: s(PrivacyPage),
      },
      {
        path: 'about',
        element: s(AboutPage),
      },
      {
        path: 'status',
        element: s(StatusPage),
      },
      {
        path: 'careers',
        element: s(CareersPage),
      },
      {
        path: 'blog',
        element: s(BlogPage),
      },
      {
        path: 'guidelines',
        element: s(CommunityGuidelinesPage),
      },
      {
        path: 'download-app',
        element: s(DownloadAppPage),
      },
      {
        // Protected Wrapper
        element: <ProtectedRoute />,
        children: [
          {
            path: 'home',
            element: s(HomePage),
          },
          {
            path: 'complete-profile',
            element: s(CompleteProfilePage),
          },
          {
            path: 'verify-email',
            element: s(VerifyEmailPage),
          },
          {
            path: 'upload',
            element: s(UploadPage),
          },
          {
            path: 'notifications',
            element: s(NotificationsPage),
          },
          {
            path: 'notifications/:id',
            element: s(NotificationDetailPage),
          },
          {
            path: 'profile',
            element: s(ProfilePage),
          },
          {
            path: 'settings',
            element: s(SettingsPage),
          },
          {
            path: 'edit-profile',
            element: s(EditProfilePage),
          },
          {
            path: 'settings/security',
            element: s(SecurityPage),
          },
          {
            path: 'settings/privacy',
            element: s(PrivacySettingsPage),
          },
          {
            path: 'settings/theme',
            element: s(ThemePage),
          },
          {
            path: 'settings/follow-requests',
            element: s(FollowRequestsPage),
          },
          {
            path: 'settings/language',
            element: s(LanguagePage),
          },
          {
            path: 'settings/help',
            element: s(HelpPage),
          },
          {
            path: 'pakar',
            element: s(PakarDashboard),
          },
          {
            path: 'admin',
            element: s(AdminDashboard),
          },
          {
            path: 'stats',
            element: s(LearningStatisticsPage),
          },
        ]
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
], {
  basename: '/app',
}); // Trigger HMR
