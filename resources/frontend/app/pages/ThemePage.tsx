import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft, Monitor, Moon, Sun, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

export default function ThemePage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.appearance'));
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();


  const themeOptions = [
    {
      id: 'light',
      title: t("theme.light") || 'Terang',
      description: t("theme.light_desc") || 'Tampilan bersih dan cerah, cocok untuk kondisi ruangan terang.',
      icon: Sun,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10'
    },
    {
      id: 'dark',
      title: t("theme.dark") || 'Gelap',
      description: t("theme.dark_desc") || 'Meredupkan layar, nyaman untuk mata di malam hari.',
      icon: Moon,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10'
    },
    {
      id: 'system',
      title: t("theme.system") || 'Ikuti Sistem',
      description: t("theme.system_desc") || 'Menyesuaikan tampilan dengan pengaturan perangkat Anda.',
      icon: Monitor,
      color: 'text-slate-500 dark:text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-white/10'
    }
  ];

  return (
    <MobileLayout hideMobileTopNav={true}>
      <div className="min-h-screen bg-slate-50 dark:bg-black/20 flex justify-center font-['Manrope']">
        <div className="w-full max-w-[800px] min-h-screen border-x border-slate-200 dark:border-white/5 bg-white dark:bg-[#13111C]">
          {/* Top Navigation */}
          <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#13111C]/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t("theme.title") || "Tampilan"}
            </h1>
          </div>

          {/* Page Content */}
          <div className="px-6 py-8">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t("theme.subtitle") || "Pilih Tema Aplikasi"}
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {t("theme.description") || "Sesuaikan tampilan aplikasi Ba-Yu untuk pengalaman membaca dan belajar yang lebih nyaman bagi Anda."}
              </p>
            </div>

            <div className="space-y-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id as any)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 group
                      ${isActive
                        ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-[0_4px_20px_rgba(79,70,229,0.08)] dark:shadow-none'
                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-indigo-100 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${option.bgColor}`}>
                      <Icon size={24} className={option.color} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-[15px] font-bold mb-1 transition-colors ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                        {option.title}
                      </h3>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {option.description}
                      </p>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isActive
                        ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500'
                        : 'border-slate-200 dark:border-white/20 group-hover:border-indigo-300 dark:group-hover:border-white/40'
                      }`}
                    >
                      {isActive && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visual Example Preview */}
            <div className="mt-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative">
              <div className="bg-slate-100 dark:bg-[#1C1A29] p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 h-6 bg-white dark:bg-[#13111C] rounded-md border border-slate-200 dark:border-white/5 opacity-50"></div>
              </div>
              <div className="p-6 bg-white dark:bg-[#13111C]">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 mb-4 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-sm bg-indigo-500 dark:bg-indigo-400"></div>
                </div>
                <div className="w-2/3 h-5 bg-slate-200 dark:bg-white/10 rounded-md mb-3"></div>
                <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-md mb-2"></div>
                <div className="w-4/5 h-3 bg-slate-100 dark:bg-white/5 rounded-md"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
