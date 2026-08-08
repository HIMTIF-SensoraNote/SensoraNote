import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { ArrowLeft, Lock, Shield, Smartphone, Loader2, KeyRound } from "lucide-react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "../hooks/useTranslation";

export default function SecurityPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.security'));
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();


    const [passwords, setPasswords] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const handleSavePassword = async () => {
        if (!passwords.current_password || !passwords.new_password || !passwords.new_password_confirmation) {
            showToast(t("security.all_fields_required"), "error");
            return;
        }

        if (passwords.new_password !== passwords.new_password_confirmation) {
            showToast(t("security.password_mismatch"), "error");
            return;
        }

        if (passwords.new_password.length < 8) {
            showToast(t("security.password_min_length"), "error");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");

            await axios.post("/api/v1/users/change-password", passwords, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            showToast(t("security.password_updated"), "success");
            setPasswords({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (error: any) {
            console.error("Failed to update password", error);
            const errData = error.response?.data;
            let errMsg = errData?.message || t("security.password_update_failed");

            // Extract Laravel validation errors if present
            if (errData && typeof errData === "object" && !errData.message && errData[Object.keys(errData)[0]]) {
                const firstErrorKey = Object.keys(errData)[0];
                errMsg = errData[firstErrorKey][0];
            } else if (errData?.errors && typeof errData.errors === "object") {
                const firstErrorKey = Object.keys(errData.errors)[0];
                errMsg = errData.errors[firstErrorKey][0];
            }

            showToast(
                t(errMsg) !== errMsg ? t(errMsg) : errMsg,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout showBottomNav={false} hideMobileTopNav={true}>
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
                        {t("security.title")}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    <div className="space-y-6 mb-10">
                        {/* Section 1: Change Password */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="w-4 h-4 text-indigo-600 dark:text-primary" />
                                <h2 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100">
                                    {t("security.change_password")}
                                </h2>
                            </div>

                            <p className="text-[13px] text-gray-500 dark:text-gray-400 font-['Manrope'] leading-relaxed mb-4">
                                {t("security.change_password_desc")}
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-['Manrope'] font-bold text-gray-900 dark:text-gray-200 mb-2">
                                        {t("security.current_password")}
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwords.current_password}
                                            onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-[#252336] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder={t("security.current_password_placeholder")}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-['Manrope'] font-bold text-gray-900 dark:text-gray-200 mb-2">
                                        {t("security.new_password")}
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.new_password}
                                        onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-[#252336] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder={t("security.new_password_placeholder")}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-['Manrope'] font-bold text-gray-900 dark:text-gray-200 mb-2">
                                        {t("security.confirm_new_password")}
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.new_password_confirmation}
                                        onChange={(e) => setPasswords({ ...passwords, new_password_confirmation: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-[#252336] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder={t("security.confirm_new_password_placeholder")}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleSavePassword}
                                disabled={loading}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-900 dark:bg-primary text-white py-3.5 rounded-xl font-['Lexend_Deca'] font-bold text-[14px] shadow-md shadow-gray-200 dark:shadow-primary/10 hover:bg-black dark:hover:bg-primary/90 transition-all disabled:opacity-70"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> {t("security.saving")}</>
                                ) : (
                                    t("security.update_password")
                                )}
                            </button>
                        </div>

                        {/* Section 2: 2FA (Mock) */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100">
                                        {t("security.two_factor_auth")}
                                    </h2>
                                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-['Manrope'] mt-0.5">
                                        {t("security.extra_protection")}
                                    </p>
                                </div>
                                <div className="w-12 h-6 bg-gray-200 dark:bg-white/10 rounded-full relative cursor-not-allowed opacity-60">
                                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                <p className="text-[12px] text-gray-500 dark:text-gray-400 font-['Manrope'] font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                                    {t("security.feature_in_development")}
                                </p>
                            </div>
                        </div>

                        {/* Section 3: Login Activity (Mock) */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none space-y-4">
                            <h2 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100">
                                {t("security.login_activity")}
                            </h2>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    <div>
                                        <h4 className="font-['Manrope'] font-bold text-[14px] text-gray-900 dark:text-gray-100">Windows • Chrome</h4>
                                        <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{t("security.active_now_extended")}</p>
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
