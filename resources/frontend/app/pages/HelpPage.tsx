import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { ArrowLeft, Search, Mail, MessageCircle, ChevronDown, BookOpen, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../contexts/AuthContext";

export default function HelpPage() {
    const { t, language } = useTranslation();
    const tr = (key: string, fallback: string) => {
        const val = t(key);
        return val && val !== key ? val : fallback;
    };
    useDocumentTitle(tr('titles.help_center', 'Pusat Bantuan'));
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const { user } = useAuth();

    // Get localized day name in the active language natively
    const getLocalizedDay = (langCode: string) => {
        try {
            return new Intl.DateTimeFormat(langCode, { weekday: 'long' }).format(new Date());
        } catch (e) {
            const indonesianDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
            return indonesianDays[new Date().getDay()];
        }
    };

    const currentDay = getLocalizedDay(language);
    const userName = user?.name || "[Nama Kamu]";

    // Get translated templates with dynamic interpolations
    const waRaw = t("help_page.wa_template", { name: userName, day: currentDay });
    const waMessage = waRaw && waRaw !== "help_page.wa_template"
        ? waRaw
        : `Halo Tim Dukungan SensoraNote, saya ${userName}. Saya membutuhkan bantuan terkait masalah: ... pada hari ${currentDay}.`;
    const waUrl = `https://wa.me/6282182643377?text=${encodeURIComponent(waMessage)}`;

    const emailSubjectRaw = t("help_page.email_subject", { name: userName });
    const emailSubject = emailSubjectRaw && emailSubjectRaw !== "help_page.email_subject"
        ? emailSubjectRaw
        : `Bantuan Kendala Aplikasi SensoraNote - ${userName}`;

    const emailBodyRaw = t("help_page.email_body", { name: userName, day: currentDay });
    const emailBody = emailBodyRaw && emailBodyRaw !== "help_page.email_body"
        ? emailBodyRaw
        : `Halo Tim Dukungan SensoraNote,\n\nSaya ${userName}. Saya membutuhkan bantuan terkait masalah:\n...\n\nKendala ini saya hadapi pada hari ${currentDay}.\n\nMohon bantuannya, terima kasih!`;
    const emailUrl = `mailto:support.bayu@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const FAQS = [
        {
            question: tr("help_page.faqs.0.q", "Bagaimana cara menjadi Pakar di SensoraNote?"),
            answer: tr("help_page.faqs.0.a", "Untuk menjadi Pakar, kamu harus sering membagikan catatan berkualitas. Jika catatanmu sering masuk kategori 'Populer' dan mendapatkan banyak like, tim Admin kami akan meninjaunya dan memberikan status Pakar.")
        },
        {
            question: tr("help_page.faqs.1.q", "Apakah saya bisa mendownload catatan ke PDF?"),
            answer: tr("help_page.faqs.1.a", "Tentu saja! Di setiap halaman detail catatan, kamu bisa menekan tombol Download di pojok kanan atas atau di bagian bawah konten untuk menyimpannya dalam format PDF.")
        },
        {
            question: tr("help_page.faqs.2.q", "Kenapa akun saya tidak bisa login?"),
            answer: tr("help_page.faqs.2.a", "Pastikan email dan kata sandi yang kamu masukkan benar. Jika kamu baru saja menghapus akun, akunmu mungkin berada dalam status Dormant. Coba login kembali untuk mengaktifkannya.")
        },
        {
            question: tr("help_page.faqs.3.q", "Bagaimana cara menulis rumus matematika?"),
            answer: tr("help_page.faqs.3.a", "Di halaman penulisan catatan, klik ikon kalkulator di toolbar samping untuk membuka editor rumus. Kamu bisa menulis formula menggunakan format KaTeX.")
        },
        {
            question: tr("help_page.faqs.4.q", "Bagaimana cara menyimpan catatan orang lain?"),
            answer: tr("help_page.faqs.4.a", "Kamu bisa menyimpan catatan yang kamu sukai dengan mengklik ikon 'Bookmark' di pojok kanan atas kartu catatan atau halaman detail catatan. Catatan yang disimpan akan muncul di tab 'Disimpan' pada profilmu.")
        },
        {
            question: tr("help_page.faqs.5.q", "Apakah catatan saya bisa dibatasi agar hanya pengikut yang dapat melihat?"),
            answer: tr("help_page.faqs.5.a", "Ya, tentu saja! Kamu dapat mengatur akunmu menjadi privat melalui menu Pengaturan > Privasi & Akun. Dengan akun privat, hanya pengguna yang kamu setujui sebagai pengikut yang dapat membaca materi lengkap catatanmu.")
        },
        {
            question: tr("help_page.faqs.6.q", "Bagaimana cara melaporkan catatan yang melanggar aturan?"),
            answer: tr("help_page.faqs.6.a", "Jika kamu menemukan catatan yang mengandung plagiasi, ujaran kebencian, atau pelanggaran lainnya, kamu bisa klik ikon titik tiga (Opsi) di pojok kanan atas catatan tersebut, lalu pilih 'Laporkan'. Tim kami akan segera meninjaunya.")
        },
        {
            question: tr("help_page.faqs.7.q", "Apa keuntungan memiliki status 'Pakar'?"),
            answer: tr("help_page.faqs.7.a", "Pengguna dengan status Pakar akan mendapatkan lencana verifikasi centang ungu di profilnya. Catatan yang mereka bagikan juga akan mendapatkan tag 'Verified' yang meningkatkan kredibilitas materi, serta berhak melakukan kurasi pada catatan pelajar lainnya.")
        },
        {
            question: tr("help_page.faqs.8.q", "Mengapa catatan saya ditolak oleh Pakar?"),
            answer: tr("help_page.faqs.8.a", "Catatan yang diajukan ke Pakar dapat ditolak jika terdeteksi plagiasi, memiliki resolusi gambar yang buruk, atau berisi rumus/teori yang kurang akurat. Kamu bisa membaca ulasan masukan dari Pakar di detail catatanmu untuk memperbaikinya.")
        },
        {
            question: tr("help_page.faqs.9.q", "Apakah platform SensoraNote ini berbayar?"),
            answer: tr("help_page.faqs.9.a", "Tidak, SensoraNote sepenuhnya gratis untuk digunakan oleh semua pelajar dan pengajar di seluruh Indonesia untuk saling berbagi ilmu pengetahuan dan catatan belajar terstruktur!")
        }
    ];

    const filteredFaqs = FAQS.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MobileLayout showBottomNav={false} hideMobileTopNav={true} hideTopNav={!user} hideSidebar={!user}>
            <div className="min-h-screen pb-12 bg-[#FAFAFA] dark:bg-[#13111C]">
                {/* Header */}
                <div className="sticky top-0 bg-[#FAFAFA]/95 dark:bg-[#13111C]/95 backdrop-blur-md z-20 border-b border-gray-100 dark:border-white/5 mb-6">
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-full transition-colors shadow-sm dark:shadow-none cursor-pointer"
                                title="Kembali"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </button>
                            <h1 className="text-gray-900 dark:text-gray-100 font-['Lexend_Deca'] font-bold text-lg sm:text-xl">
                                {tr("help_page.title", "Pusat Bantuan")}
                            </h1>
                        </div>
                        <div className="w-10"></div>
                    </div>
                </div>

                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Hero Section */}
                    <div className="text-center max-w-2xl mx-auto pt-2">
                        <h2 className="font-['Lexend_Deca'] font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                            {tr("help_page.hero_title", "Halo, ada yang bisa dibantu?")}
                        </h2>
                        <p className="font-['Manrope'] text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            {tr("help_page.hero_desc", "Cari jawaban atau hubungi tim dukungan kami di bawah ini.")}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={tr("help_page.search_placeholder", "Cari pertanyaan...")}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1C1A29] border border-gray-200/80 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-all"
                            />
                        </div>
                    </div>

                    {/* Responsive 2-Column Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                        {/* Left Column: FAQ Section (lg:col-span-8) */}
                        <div className="lg:col-span-8">
                            <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-xs dark:shadow-none">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                                    <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2.5">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                        {tr("help_page.faq_title", "Pertanyaan Umum (FAQ)")}
                                    </h3>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                        {filteredFaqs.length} {tr("help_page.questions", "pertanyaan")}
                                    </span>
                                </div>
                                
                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredFaqs.length > 0 ? (
                                        filteredFaqs.map((faq, index) => (
                                             <div key={index} className="py-4 first:pt-0 last:pb-0">
                                                <button 
                                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                    className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                                                >
                                                    <span className="font-['Manrope'] font-bold text-[15px] text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors pr-4">
                                                        {faq.question}
                                                    </span>
                                                    <ChevronDown 
                                                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === index ? "rotate-180 text-primary" : ""}`} 
                                                    />
                                                </button>
                                                <div 
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"}`}
                                                >
                                                    <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed pr-6 pl-1">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-gray-500 font-['Manrope'] text-[14px]">
                                            {(tr("help_page.no_results", 'Tidak ada hasil untuk pencarian "{query}"')).replace('{query}', searchQuery)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Support Channels & Guidelines (lg:col-span-4) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Contact Support */}
                            <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-white/5 shadow-xs dark:shadow-none">
                                <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg mb-2">
                                    {tr("help_page.contact_title", "Masih Butuh Bantuan?")}
                                </h3>
                                <p className="font-['Manrope'] text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                                    {tr("help_page.contact_subtitle", "Tim dukungan kami siap mendampingi proses belajarmu.")}
                                </p>
                                
                                <div className="space-y-3">
                                    <a 
                                        href={waUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-['Manrope'] font-bold text-[14px] text-emerald-900 dark:text-emerald-100">{tr("help_page.contact_wa_title", "WhatsApp")}</h4>
                                            <p className="font-['Manrope'] text-[12px] text-emerald-700 dark:text-emerald-300/80 mt-0.5">{tr("help_page.contact_wa_desc", "Respons cepat")}</p>
                                        </div>
                                    </a>

                                    <a 
                                        href={emailUrl} 
                                        className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-['Manrope'] font-bold text-[14px] text-blue-900 dark:text-blue-100">{tr("help_page.contact_email_title", "Email")}</h4>
                                            <p className="font-['Manrope'] text-[12px] text-blue-700 dark:text-blue-300/80 mt-0.5">{tr("help_page.contact_email_desc", "Detail & lampiran")}</p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Community Guidelines Link */}
                            <Link to="/guidelines" className="block w-full bg-gray-900 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-3xl p-6 shadow-xs dark:shadow-none hover:bg-black dark:hover:bg-white/10 transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-['Lexend_Deca'] font-bold text-white mb-1">
                                            {tr("help_page.guidelines_title", "Panduan Komunitas")}
                                        </h3>
                                        <p className="font-['Manrope'] text-[13px] text-gray-400 leading-relaxed">
                                            {tr("help_page.guidelines_desc", "Baca aturan dan etika berbagi catatan di SensoraNote.")}
                                        </p>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors shrink-0 ml-3" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
