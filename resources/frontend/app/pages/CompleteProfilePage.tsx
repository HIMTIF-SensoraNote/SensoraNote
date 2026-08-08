import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from '../hooks/useTranslation';
import ApplicationLogo from '../components/ApplicationLogo';
import { User, Building, GraduationCap, ArrowRight } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import axios from 'axios';

export default function CompleteProfilePage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.complete_profile'));
    const { user, updateUserSession } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        jenjang_pendidikan: user?.jenjang_pendidikan || 'SMA',
        profesi: user?.profesi || 'Pelajar',
        school: user?.school || '',
    });
    
    const handleJenjangChange = (val: string) => {
        let newProfesi = formData.profesi;
        if (['SD', 'SMP', 'SMA'].includes(val)) newProfesi = 'Pelajar';
        else if (val === 'Kuliah') newProfesi = 'Mahasiswa';
        else if (val === 'Umum') newProfesi = 'Umum';
        
        setFormData({ ...formData, jenjang_pendidikan: val, profesi: newProfesi });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    // If profile is already completed, redirect to home
    useEffect(() => {
        if (user && user.profile_completed) {
            navigate('/home', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.username.match(/^[a-zA-Z0-9_]+$/)) {
            showToast(t('complete_profile.username_error'), "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.put('/api/v1/users/me', formData);
            
            // Update context
            updateUserSession({
                ...response.data.user,
                profile_completed: true
            });
            
            showToast(t('complete_profile.success_msg'), "success");
            navigate('/home', { replace: true });
        } catch (error: any) {
            console.error("Gagal update profil:", error);
            const msg = error.response?.data?.message || t('complete_profile.error_msg');
            showToast(msg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#13111C] px-6 py-12 flex flex-col justify-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-50 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 opacity-70"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-50 dark:bg-fuchsia-500/10 rounded-full blur-3xl -z-10 opacity-70"></div>

                <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <ApplicationLogo className="w-16 h-16 drop-shadow-md" />
                        </div>
                        <h1 className="font-['Lexend_Deca'] text-[28px] sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 leading-tight tracking-tight">
                            {t('complete_profile.title')}
                        </h1>
                        <p className="font-['Manrope'] text-[15px] text-gray-500 dark:text-gray-400 font-medium">
                            {t('complete_profile.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                {t('complete_profile.full_name_label')}
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                {t('complete_profile.username_label')} <span className="text-slate-500 dark:text-slate-400 font-normal">{t('complete_profile.username_hint')}</span>
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors">@</span>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                                    className="w-full pl-9 pr-4 py-3.5 bg-gray-50 dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                {t('complete_profile.education_label')}
                            </label>
                            <div className="relative group z-50">
                                <CustomSelect
                                    value={formData.jenjang_pendidikan}
                                    onChange={(val) => handleJenjangChange(val as string)}
                                    icon={<GraduationCap className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                                    buttonClassName="bg-gray-50 dark:bg-[#1C1A29] rounded-2xl pl-11 pr-4 py-3.5"
                                    options={[
                                        { value: "SD", label: t('edu_levels.SD') !== 'edu_levels.SD' ? t('edu_levels.SD') : "Sekolah Dasar (SD)" },
                                        { value: "SMP", label: t('edu_levels.SMP') !== 'edu_levels.SMP' ? t('edu_levels.SMP') : "Menengah Pertama (SMP)" },
                                        { value: "SMA", label: t('edu_levels.SMA') !== 'edu_levels.SMA' ? t('edu_levels.SMA') : "Menengah Atas (SMA/SMK)" },
                                        { value: "Kuliah", label: t('edu_levels.Kuliah') !== 'edu_levels.Kuliah' ? t('edu_levels.Kuliah') : "Perguruan Tinggi (Kuliah)" },
                                        { value: "Umum", label: t('edu_levels.Umum') !== 'edu_levels.Umum' ? t('edu_levels.Umum') : "Umum" },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                {t('complete_profile.profession_label')}
                            </label>
                            <div className="relative group z-40">
                                <CustomSelect
                                    value={formData.profesi}
                                    onChange={(val) => setFormData({ ...formData, profesi: val as string })}
                                    icon={<User className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                                    buttonClassName="bg-gray-50 dark:bg-[#1C1A29] rounded-2xl pl-11 pr-4 py-3.5"
                                    options={[
                                        { value: "Pelajar", label: t('complete_profile.prof_student') !== 'complete_profile.prof_student' ? t('complete_profile.prof_student') : "Pelajar" },
                                        { value: "Mahasiswa", label: t('complete_profile.prof_college') !== 'complete_profile.prof_college' ? t('complete_profile.prof_college') : "Mahasiswa" },
                                        { value: "Pengajar", label: t('complete_profile.prof_teacher') !== 'complete_profile.prof_teacher' ? t('complete_profile.prof_teacher') : "Pengajar (Guru/Dosen)" },
                                        { value: "Umum", label: t('complete_profile.prof_general') !== 'complete_profile.prof_general' ? t('complete_profile.prof_general') : "Umum / Profesional" },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                {t('complete_profile.school_label')}
                            </label>
                            <div className="relative group z-30">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                <input
                                    type="text"
                                    value={formData.school}
                                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    placeholder={t('complete_profile.school_placeholder')}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-primary hover:bg-indigo-700 text-white py-4 rounded-full font-['Lexend_Deca'] font-bold text-[15px] shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{t('complete_profile.submitting')}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t('complete_profile.submit_button')}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
    );
}
