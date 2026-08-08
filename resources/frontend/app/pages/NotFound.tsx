import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Link } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';

export default function NotFound() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.page_not_found'));

  return (
    <MobileLayout showBottomNav={false}>
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] dark:bg-[#13111C] transition-colors duration-500">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('not_found.message')}</p>
          <Link
            to="/home"
            className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-600 transition-colors"
          >
            {t('not_found.back_home')}
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
