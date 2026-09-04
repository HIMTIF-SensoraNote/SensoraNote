import { useState, useMemo } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft, Check, Globe, Monitor, Search, X } from 'lucide-react';
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
  const { language, setLanguage, resolvedLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');


  const languageOptions: LangOption[] = [
    { id: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩', description: 'Semua teks ditampilkan dalam Bahasa Indonesia.' },
    { id: 'en', nativeName: 'English', englishName: 'English', flag: '🌐', description: 'All text will be displayed in English.' },
    { id: 'en-US', nativeName: 'English (US)', englishName: 'English (US)', flag: '🇺🇸', description: 'All text will be displayed in American English.' },
    { id: 'en-GB', nativeName: 'English (UK)', englishName: 'English (UK)', flag: '🇬🇧', description: 'All text will be displayed in British English.' },
    { id: 'zh', nativeName: '中文 (简体)', englishName: 'Chinese (Simplified)', flag: '🇨🇳', description: '所有文本将以简体中文显示。' },
    { id: 'zh-TW', nativeName: '中文 (繁體)', englishName: 'Chinese (Traditional)', flag: '🇹🇼', description: '所有文本將以繁體中文顯示。' },
    { id: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵', description: 'すべてのテキストが日本語で表示されます。' },
    { id: 'ko', nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷', description: '모든 텍스트가 한국어로 표시됩니다.' },
    { id: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸', description: 'Todo el texto se mostrará en español.' },
    { id: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷', description: 'Tout le texte sera affiché en français.' },
    { id: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪', description: 'Alle Texte werden auf Deutsch angezeigt.' },
    { id: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹', description: 'Tutti i testi saranno visualizzati in italiano.' },
    { id: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇧🇷', description: 'Todo o texto será exibido em português.' },
    { id: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺', description: 'Весь текст будет отображаться на русском языке.' },
    { id: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦', description: 'سيتم عرض جميع النصوص باللغة العربية.' },
    { id: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳', description: 'सभी टेक्स्ट हिन्दी में प्रदर्शित होंगे।' },
    { id: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩', description: 'সমস্ত টেক্সট বাংলায় প্রদর্শিত হবে।' },
    { id: 'ur', nativeName: 'اردو', englishName: 'Urdu', flag: '🇵🇰', description: 'تمام متن اردو میں دکھایا جائے گا۔' },
    { id: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷', description: 'Tüm metinler Türkçe olarak görüntülenecektir.' },
    { id: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳', description: 'Tất cả văn bản sẽ được hiển thị bằng tiếng Việt.' },
    { id: 'th', nativeName: 'ไทย', englishName: 'Thai', flag: '🇹🇭', description: 'ข้อความทั้งหมดจะแสดงเป็นภาษาไทย' },
    { id: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱', description: 'Alle tekst wordt in het Nederlands weergegeven.' },
    { id: 'pl', nativeName: 'Polski', englishName: 'Polish', flag: '🇵🇱', description: 'Cały tekst będzie wyświetlany w języku polskim.' },
    { id: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', flag: '🇲🇾', description: 'Semua teks akan dipaparkan dalam Bahasa Melayu.' },
    { id: 'af', nativeName: 'Afrikaans', englishName: 'Afrikaans', flag: '🇿🇦', description: 'Alle teks sal in Afrikaans vertoon word.' },
    { id: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', flag: '🇪🇹', description: 'ሁሉም ጽሑፎች በአማርኛ ይታያሉ።' },
    { id: 'cs', nativeName: 'Čeština', englishName: 'Czech', flag: '🇨🇿', description: 'Veškerý text se zobrazí v češtině.' },
    { id: 'da', nativeName: 'Dansk', englishName: 'Danish', flag: '🇩🇰', description: 'Al tekst vises på dansk.' },
    { id: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', flag: '🇬🇷', description: 'Όλο το κείμενο θα εμφανίζεται στα ελληνικά.' },
    { id: 'fa', nativeName: 'فارسی', englishName: 'Persian', flag: '🇮🇷', description: 'تمام متون به زبان فارسی نمایش داده خواهند شد.' },
    { id: 'fi', nativeName: 'Suomi', englishName: 'Finnish', flag: '🇫🇮', description: 'Kaikki tekstit näytetään suomeksi.' },
    { id: 'he', nativeName: 'עברית', englishName: 'Hebrew', flag: '🇮🇱', description: 'כל הטקסט יוצג בעברית.' },
    { id: 'hu', nativeName: 'Magyar', englishName: 'Hungarian', flag: '🇭🇺', description: 'Minden szöveg magyarul jelenik meg.' },
    { id: 'km', nativeName: 'ខ្មែរ', englishName: 'Khmer', flag: '🇰🇭', description: 'អត្ថបទទាំងអស់នឹងត្រូវបង្ហាញជាភាសាខ្មែរ។' },
    { id: 'lo', nativeName: 'ລາວ', englishName: 'Lao', flag: '🇱🇦', description: 'ຂໍ້ຄວາມທັງໝົດຈະສະແດງເປັນພາສາລາວ.' },
    { id: 'my', nativeName: 'မြန်မာ', englishName: 'Burmese', flag: '🇲🇲', description: 'စာသားအားလုံးကို မြန်မာဘာသာဖြင့် ဖော်ပြပါမည်။' },
    { id: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', flag: '🇳🇵', description: 'सबै पाठ नेपालीमा प्रदर्शित हुनेछ।' },
    { id: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', flag: '🇮🇳', description: 'ਸਾਰਾ ਟੈਕਸਟ ਪੰਜਾਬੀ ਵਿੱਚ ਪ੍ਰਦਰਸ਼ਿਤ ਕੀਤਾ ਜਾਵੇਗਾ।' },
    { id: 'ro', nativeName: 'Română', englishName: 'Romanian', flag: '🇷🇴', description: 'Tot textul va fi afișat în limba română.' },
    { id: 'si', nativeName: 'සිංහල', englishName: 'Sinhala', flag: '🇱🇰', description: 'සියලුම පෙළ සිංහලෙන් දිස්වනු ඇත.' },
    { id: 'sv', nativeName: 'Svenska', englishName: 'Swedish', flag: '🇸🇪', description: 'All text visas på svenska.' },
    { id: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', flag: '🇰🇪', description: 'Maandishi yote yataonyeshwa kwa Kiswahili.' },
    { id: 'tl', nativeName: 'Filipino', englishName: 'Filipino / Tagalog', flag: '🇵🇭', description: 'Lahat ng teksto ay ipapakita sa Filipino.' },
    { id: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', flag: '🇺🇦', description: 'Весь текст буде відображатися українською мовою.' },
    { id: 'zu', nativeName: 'isiZulu', englishName: 'Zulu', flag: '🇿🇦', description: 'Yonke imibhalo izoboniswa ngesiZulu.' }
  ];

  const systemOption: LangOption = {
    id: 'system',
    nativeName: t('language.system'),
    englishName: 'Follow System',
    flag: '🌐',
    description: t('language.system_desc'),
  };

  const filteredOptions = useMemo(() => {
    const list = [...languageOptions].sort((a, b) => a.englishName.localeCompare(b.englishName));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(opt =>
      opt.nativeName.toLowerCase().includes(q) ||
      opt.englishName.toLowerCase().includes(q) ||
      opt.id.toLowerCase().includes(q)
    );
  }, [languageOptions, searchQuery]);

  const activeResolvedName = useMemo(() => {
    const found = languageOptions.find(opt => opt.id === resolvedLanguage);
    return found ? `${found.flag} ${found.nativeName}` : resolvedLanguage;
  }, [languageOptions, resolvedLanguage]);

  return (
    <MobileLayout hideMobileTopNav={true}>
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#13111C] font-['Manrope'] pb-12">
        {/* Top Navigation */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#13111C]/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer shrink-0"
                title="Kembali"
              >
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-['Lexend_Deca'] truncate">
                {t('language.title')}
              </h1>
            </div>
            <span className="text-xs font-semibold px-2.5 sm:px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20 shrink-0 whitespace-nowrap">
              45 {t('settings.language') || 'Bahasa'}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 font-['Lexend_Deca']">
                {t('language.subtitle')}
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                {t('language.description')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') || 'Cari bahasa...'}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* System Option */}
          <div>
            <button
              onClick={() => setLanguage('system')}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 sm:gap-5 group cursor-pointer
                ${language === 'system'
                  ? 'bg-blue-50/60 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500/40 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-white dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-blue-200 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-white/10 shadow-xs'
                }
              `}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Monitor size={24} strokeWidth={language === 'system' ? 2.5 : 2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={`text-[15px] font-bold transition-colors ${language === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                    {systemOption.nativeName}
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                    {systemOption.englishName}
                  </span>
                  {language === 'system' && (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                      Aktif: {activeResolvedName}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {systemOption.description}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                ${language === 'system'
                  ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                  : 'border-slate-300 dark:border-white/20 group-hover:border-blue-300 dark:group-hover:border-white/40'
                }`}
              >
                {language === 'system' && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {searchQuery ? `${filteredOptions.length} Hasil` : t('language.title')}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Language Options Grid (Responsive: 1 col on mobile, 2 cols on tablet/laptop, 3 cols on large screens) */}
          {filteredOptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredOptions.map((option) => {
                const isActive = language === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => setLanguage(option.id)}
                    className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 sm:gap-4 group cursor-pointer
                      ${isActive
                        ? 'bg-blue-50/70 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500/40 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-blue-200 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-white/10 shadow-xs'
                      }
                    `}
                  >
                    <span className="text-2xl sm:text-3xl shrink-0 select-none" role="img" aria-label={option.englishName}>
                      {option.flag}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className={`text-[14px] sm:text-[15px] font-bold transition-colors truncate ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                          {option.nativeName}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 shrink-0">
                          {option.englishName}
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed truncate">
                        {option.description}
                      </p>
                    </div>

                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isActive
                        ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                        : 'border-slate-300 dark:border-white/20 group-hover:border-blue-300 dark:group-hover:border-white/40'
                      }`}
                    >
                      {isActive && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-8">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada bahasa yang cocok dengan "{searchQuery}"
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Coba cari dengan nama lokal, nama internasional, atau kode bahasa.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-sm bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 font-medium transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-8 p-4 sm:p-5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="flex items-start gap-3">
              <Globe size={20} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {t('language.info')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
