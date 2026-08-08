import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft, Check, Globe, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage, type LanguagePreference } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

interface LangOption {
  id: LanguagePreference;
  nativeName: string;
  englishName: string;
  flag: string;
  description: string;
}

export default function LanguagePage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.language'));
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();


  const languageOptions: LangOption[] = [
    { id: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩', description: 'Semua teks ditampilkan dalam Bahasa Indonesia.' },
    { id: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸', description: 'All text will be displayed in English.' },
    { id: 'zh', nativeName: '中文', englishName: 'Chinese (Mandarin)', flag: '🇨🇳', description: '所有文本将以中文显示。' },
    { id: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳', description: 'सभी टेक्स्ट हिन्दी में प्रदर्शित होंगे।' },
    { id: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸', description: 'Todo el texto se mostrará en español.' },
    { id: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷', description: 'Tout le texte sera affiché en français.' },
    { id: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦', description: 'سيتم عرض جميع النصوص باللغة العربية.' },
    { id: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩', description: 'সমস্ত টেক্সট বাংলায় প্রদর্শित হবে।' },
    { id: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺', description: 'Весь текст будет отображаться на русском языке.' },
    { id: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇧🇷', description: 'Todo o texto será exibido em português.' },
    { id: 'ur', nativeName: 'اردو', englishName: 'Urdu', flag: '🇵🇰', description: 'تمام متن اردو میں دکھایا جائے گا۔' },
    { id: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪', description: 'Alle Texte werden auf Deutsch angezeigt.' },
    { id: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵', description: 'すべてのテキストが日本語で表示されます。' },
    { id: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷', description: 'Tüm metinler Türkçe olarak görüntülenecektir.' },
    { id: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳', description: 'Tất cả văn bản sẽ được hiển thị bằng tiếng Việt.' },
    { id: 'ko', nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷', description: '모든 텍스트가 한국어로 표시됩니다.' },
    { id: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹', description: 'Tutti i testi saranno visualizzati in italiano.' },
    { id: 'th', nativeName: 'ไทย', englishName: 'Thai', flag: '🇹🇭', description: 'ข้อความทั้งหมดจะแสดงเป็นภาษาไทย' },
    { id: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱', description: 'Alle tekst wordt in het Nederlands weergegeven.' },
    { id: 'pl', nativeName: 'Polski', englishName: 'Polish', flag: '🇵🇱', description: 'Cały tekst będzie wyświetlany w języku polskim.' }
  ];

  const systemOption: LangOption = {
    id: 'system',
    nativeName: t('language.system'),
    englishName: 'Follow System',
    flag: '🌐',
    description: t('language.system_desc'),
  };

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
              {t('language.title')}
            </h1>
          </div>

          {/* Page Content */}
          <div className="px-6 py-8">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('language.subtitle')}
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {t('language.description')}
              </p>
            </div>

            {/* System Option */}
            <div className="mb-6">
              <button
                onClick={() => setLanguage('system')}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 group
                  ${language === 'system'
                    ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-[0_4px_20px_rgba(79,70,229,0.08)] dark:shadow-none'
                    : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-blue-100 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10'
                  }
                `}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors bg-slate-100 dark:bg-white/10`}>
                  <Monitor size={24} className="text-slate-500 dark:text-slate-400" strokeWidth={language === 'system' ? 2.5 : 2} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-[15px] font-bold mb-1 transition-colors ${language === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                    {systemOption.nativeName}
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {systemOption.description}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                  ${language === 'system'
                    ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                    : 'border-slate-200 dark:border-white/20 group-hover:border-blue-300 dark:group-hover:border-white/40'
                  }`}
                >
                  {language === 'system' && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {t('language.title')}
              </span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
            </div>

            {/* Language Options */}
            <div className="space-y-3">
              {[...languageOptions]
                .sort((a, b) => a.englishName.localeCompare(b.englishName))
                .map((option) => {
                const isActive = language === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => setLanguage(option.id)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 sm:gap-5 group
                      ${isActive
                        ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-[0_4px_20px_rgba(79,70,229,0.08)] dark:shadow-none'
                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-blue-100 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-[15px] font-bold transition-colors truncate ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                          {option.nativeName}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                          {option.englishName}
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed truncate">
                        {option.description}
                      </p>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isActive
                        ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                        : 'border-slate-200 dark:border-white/20 group-hover:border-blue-300 dark:group-hover:border-white/40'
                      }`}
                    >
                      {isActive && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info Footer */}
            <div className="mt-10 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-start gap-3">
                <Globe size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t('language.info')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
