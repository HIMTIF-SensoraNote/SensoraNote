import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft, Monitor, Moon, Sun, Check, Sparkles } from 'lucide-react';
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
      color: 'text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10'
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
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#13111C] font-['Manrope'] pb-12">
        {/* Top Navigation */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#13111C]/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => navigate(-1)}
                className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
                title="Kembali"
              >
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-['Lexend_Deca']">
                {t("theme.title") || "Tampilan"}
              </h1>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20">
              {theme === 'light' ? 'Mode Terang' : theme === 'dark' ? 'Mode Gelap' : 'Ikuti Sistem'}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 font-['Lexend_Deca']">
              {t("theme.subtitle") || "Pilih Tema Aplikasi"}
            </h2>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
              {t("theme.description") || "Sesuaikan tampilan aplikasi SensoraNote untuk pengalaman membaca dan belajar yang lebih nyaman bagi Anda."}
            </p>
          </div>

          {/* Theme Cards Grid (Responsive: 1 col on mobile, 3 on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id as any)}
                  className={`text-left p-5 sm:p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden
                    ${isActive
                      ? 'bg-blue-50/60 dark:bg-blue-500/10 border-blue-400/80 dark:border-blue-500/50 shadow-md dark:shadow-none ring-2 ring-blue-500/30'
                      : 'bg-white dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-blue-200 dark:hover:border-white/20 hover:bg-slate-50/70 dark:hover:bg-white/10 shadow-sm dark:shadow-none'
                    }
                  `}
                >
                  {/* Top Row: Icon + Selection Circle */}
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${option.bgColor}`}>
                      <Icon size={24} className={option.color} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isActive
                        ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                        : 'border-slate-300 dark:border-white/20 group-hover:border-blue-300 dark:group-hover:border-white/40'
                      }`}
                    >
                      {isActive && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 mb-5">
                    <h3 className={`text-base font-bold mb-1.5 transition-colors ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                      {option.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Miniature Visual Preview Canvas inside each card */}
                  <div className="w-full h-24 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden relative select-none">
                    {option.id === 'light' && (
                      <div className="w-full h-full bg-slate-50 p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div className="ml-auto w-12 h-2 rounded bg-slate-200" />
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-slate-200/80 shadow-xs flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-blue-500 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="w-3/4 h-1.5 bg-slate-700 rounded" />
                            <div className="w-1/2 h-1 bg-slate-300 rounded" />
                          </div>
                        </div>
                      </div>
                    )}
                    {option.id === 'dark' && (
                      <div className="w-full h-full bg-[#13111C] p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-400/80" />
                          <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                          <div className="ml-auto w-12 h-2 rounded bg-white/10" />
                        </div>
                        <div className="bg-[#1C1A29] rounded-lg p-2 border border-white/10 shadow-xs flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-blue-500 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
                            <div className="w-1/2 h-1 bg-white/20 rounded" />
                          </div>
                        </div>
                      </div>
                    )}
                    {option.id === 'system' && (
                      <div className="w-full h-full flex">
                        <div className="w-1/2 h-full bg-slate-50 p-2 border-r border-slate-200 flex flex-col justify-between">
                          <div className="w-8 h-1.5 bg-slate-300 rounded" />
                          <div className="w-full h-6 bg-white rounded border border-slate-200 p-1">
                            <div className="w-2/3 h-1 bg-blue-500 rounded" />
                          </div>
                        </div>
                        <div className="w-1/2 h-full bg-[#13111C] p-2 flex flex-col justify-between">
                          <div className="w-8 h-1.5 bg-white/20 rounded ml-auto" />
                          <div className="w-full h-6 bg-[#1C1A29] rounded border border-white/10 p-1">
                            <div className="w-2/3 h-1 bg-blue-400 rounded" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Visual Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pratinjau Antarmuka ({theme === 'light' ? 'Mode Terang' : theme === 'dark' ? 'Mode Gelap' : 'Mode Sistem'})
              </span>
            </div>

            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#13111C] transition-all duration-300">
              {/* Window Header */}
              <div className="bg-slate-100/80 dark:bg-[#1C1A29] px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-3 text-xs font-semibold text-slate-500 dark:text-slate-400 font-['Lexend_Deca']">
                    SensoraNote Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 sm:w-40 h-6 bg-white dark:bg-[#13111C] rounded-lg border border-slate-200 dark:border-white/10 opacity-70"></div>
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    S
                  </div>
                </div>
              </div>

              {/* Window Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl font-['Lexend_Deca']">
                      SN
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-['Lexend_Deca']">
                        Belajar Fisika Kuantum & Aksesibilitas
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Diposting oleh Dr. Budi Santoso • 15 Menit yang lalu
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-500/20">
                      Pilihan Pakar
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-100 dark:border-emerald-500/20">
                      Braille Ready
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="w-full h-3.5 bg-slate-100 dark:bg-white/5 rounded-md"></div>
                  <div className="w-5/6 h-3.5 bg-slate-100 dark:bg-white/5 rounded-md"></div>
                  <div className="w-4/6 h-3.5 bg-slate-100 dark:bg-white/5 rounded-md"></div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs">
                    Baca Catatan
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    Simpan Catatan
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MobileLayout>
  );
}
