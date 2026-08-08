import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { ArrowLeft, Search, Mail, MessageCircle, ChevronDown, BookOpen, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../contexts/AuthContext";

export default function HelpPage() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.help_center'));
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
    const waMessage = t("help_page.wa_template", { name: userName, day: currentDay }) ||
        `Halo Tim Dukungan Ba-Yu, saya ${userName}. Saya membutuhkan bantuan terkait masalah: ... pada hari ${currentDay}.`;
    const waUrl = `https://wa.me/6282182643377?text=${encodeURIComponent(waMessage)}`;

    const emailSubject = t("help_page.email_subject", { name: userName }) ||
        `Bantuan Kendala Aplikasi Ba-Yu - ${userName}`;
    const emailBody = t("help_page.email_body", { name: userName, day: currentDay }) ||
        `Halo Tim Dukungan Ba-Yu,\n\nSaya ${userName}. Saya membutuhkan bantuan terkait masalah:\n...\n\nKendala ini saya hadapi pada hari ${currentDay}.\n\nMohon bantuannya, terima kasih!`;
    const emailUrl = `mailto:support.bayu@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const FAQS = [
        {
            question: t("help_page.faqs.0.q") || "Bagaimana cara menjadi Pakar di Ba-Yu?",
            answer: t("help_page.faqs.0.a") || "Untuk menjadi Pakar, kamu harus sering membagikan catatan berkualitas. Jika catatanmu sering masuk kategori 'Populer' dan mendapatkan banyak like, tim Admin kami akan meninjaunya dan memberikan status Pakar."
        },
        {
            question: t("help_page.faqs.1.q") || "Apakah saya bisa mendownload catatan ke PDF?",
            answer: t("help_page.faqs.1.a") || "Tentu saja! Di setiap halaman detail catatan, kamu bisa menekan tombol Download di pojok kanan atas atau di bagian bawah konten untuk menyimpannya dalam format PDF."
        },
        {
            question: t("help_page.faqs.2.q") || "Kenapa akun saya tidak bisa login?",
            answer: t("help_page.faqs.2.a") || "Pastikan email dan kata sandi yang kamu masukkan benar. Jika kamu baru saja menghapus akun, akunmu mungkin berada dalam status Dormant. Coba login kembali untuk mengaktifkannya."
        },
        {
            question: t("help_page.faqs.3.q") || "Bagaimana cara menulis rumus matematika?",
            answer: t("help_page.faqs.3.a") || "Di halaman penulisan catatan, klik ikon kalkulator di toolbar samping untuk membuka editor rumus. Kamu bisa menulis formula menggunakan format KaTeX."
        },
        {
            question: t("help_page.faqs.4.q") || "Bagaimana cara menyimpan catatan orang lain?",
            answer: t("help_page.faqs.4.a") || "Kamu bisa menyimpan catatan yang kamu sukai dengan mengklik ikon 'Bookmark' di pojok kanan atas kartu catatan atau halaman detail catatan. Catatan yang disimpan akan muncul di tab 'Disimpan' pada profilmu."
        },
        {
            question: t("help_page.faqs.5.q") || "Apakah catatan saya bisa dibatasi agar hanya pengikut yang dapat melihat?",
            answer: t("help_page.faqs.5.a") || "Ya, tentu saja! Kamu dapat mengatur akunmu menjadi privat melalui menu Pengaturan > Privasi & Akun. Dengan akun privat, hanya pengguna yang kamu setujui sebagai pengikut yang dapat membaca materi lengkap catatanmu."
        },
        {
            question: t("help_page.faqs.6.q") || "Bagaimana cara melaporkan catatan yang melanggar aturan?",
            answer: t("help_page.faqs.6.a") || "Jika kamu menemukan catatan yang mengandung plagiasi, ujaran kebencian, atau pelanggaran lainnya, kamu bisa klik ikon titik tiga (Opsi) di pojok kanan atas catatan tersebut, lalu pilih 'Laporkan'. Tim kami akan segera meninjaunya."
        },
        {
            question: t("help_page.faqs.7.q") || "Apa keuntungan memiliki status 'Pakar'?",
            answer: t("help_page.faqs.7.a") || "Pengguna dengan status Pakar akan mendapatkan lencana verifikasi centang ungu di profilnya. Catatan yang mereka bagikan juga akan mendapatkan tag 'Verified' yang meningkatkan kredibilitas materi, serta berhak melakukan kurasi pada catatan pelajar lainnya."
        },
        {
            question: t("help_page.faqs.8.q") || "Mengapa catatan saya ditolak oleh Pakar?",
            answer: t("help_page.faqs.8.a") || "Catatan yang diajukan ke Pakar dapat ditolak jika terdeteksi plagiasi, memiliki resolusi gambar yang buruk, atau berisi rumus/teori yang kurang akurat. Kamu bisa membaca ulasan masukan dari Pakar di detail catatanmu untuk memperbaikinya."
        },
        {
            question: t("help_page.faqs.9.q") || "Apakah platform Ba-Yu ini berbayar?",
            answer: t("help_page.faqs.9.a") || "Tidak, Ba-Yu sepenuhnya gratis untuk digunakan oleh semua pelajar dan pengajar di seluruh Indonesia untuk saling berbagi ilmu pengetahuan dan catatan belajar terstruktur!"
        }
    ];

    const filteredFaqs = FAQS.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MobileLayout showBottomNav={false} hideMobileTopNav={true} hideTopNav={!user} hideSidebar={!user}>
            <div className="min-h-screen pb-10 bg-[#FAFAFA] dark:bg-[#13111C]">
                {/* Header */}
                <div className="sticky top-0 bg-[#FAFAFA]/95 dark:bg-[#13111C]/95 backdrop-blur-md z-20 px-5 pt-8 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-full transition-colors shadow-sm dark:shadow-none"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-gray-900 dark:text-gray-100 font-['Lexend_Deca'] font-bold text-lg">
                        {t("help_page.title") || "Pusat Bantuan"}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <h2 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-2">
                            {t("help_page.hero_title") || "Halo, ada yang bisa dibantu?"}
                        </h2>
                        <p className="font-['Manrope'] text-[14px] text-gray-500 dark:text-gray-400">
                            {t("help_page.hero_desc") || "Cari jawaban atau hubungi tim dukungan kami di bawah ini."}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("help_page.search_placeholder") || "Cari pertanyaan..."}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                        />
                    </div>

                    <div className="space-y-6 mb-10">
                        {/* FAQ Section */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                {t("help_page.faq_title") || "Pertanyaan Umum (FAQ)"}
                            </h3>
                            
                            <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, index) => (
                                        <div key={index} className="py-3">
                                            <button 
                                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                className="w-full flex items-center justify-between text-left focus:outline-none group"
                                            >
                                                <span className="font-['Manrope'] font-bold text-[14px] text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                                                    {faq.question}
                                                </span>
                                                <ChevronDown 
                                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openFaq === index ? "rotate-180 text-primary" : ""}`} 
                                                />
                                            </button>
                                            <div 
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? "max-h-60 mt-2 opacity-100" : "max-h-0 opacity-0"}`}
                                            >
                                                <p className="font-['Manrope'] text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed pr-6">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-gray-500 font-['Manrope'] text-[13px]">
                                        {(t("help_page.no_results") || 'Tidak ada hasil untuk pencarian "{query}"').replace('{query}', searchQuery)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {t("help_page.contact_title") || "Masih Butuh Bantuan?"}
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a 
                                    href={waUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-['Manrope'] font-bold text-[14px] text-emerald-900 dark:text-emerald-100">{t("help_page.contact_wa_title") || "WhatsApp"}</h4>
                                        <p className="font-['Manrope'] text-[12px] text-emerald-700 dark:text-emerald-300/80 mt-0.5">{t("help_page.contact_wa_desc") || "Respons cepat"}</p>
                                    </div>
                                </a>

                                <a 
                                    href={emailUrl} 
                                    className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-['Manrope'] font-bold text-[14px] text-blue-900 dark:text-blue-100">{t("help_page.contact_email_title") || "Email"}</h4>
                                        <p className="font-['Manrope'] text-[12px] text-blue-700 dark:text-blue-300/80 mt-0.5">{t("help_page.contact_email_desc") || "Detail & lampiran"}</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Community Guidelines Link */}
                        <Link to="/guidelines" className="block w-full bg-gray-900 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none hover:bg-black dark:hover:bg-white/10 transition-colors group cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-['Lexend_Deca'] font-bold text-white mb-1">
                                        {t("help_page.guidelines_title") || "Panduan Komunitas"}
                                    </h3>
                                    <p className="font-['Manrope'] text-[13px] text-gray-400">
                                        {t("help_page.guidelines_desc") || "Baca aturan dan etika berbagi catatan di Ba-Yu."}
                                    </p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
