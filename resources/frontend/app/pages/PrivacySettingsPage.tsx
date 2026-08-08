import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { ArrowLeft, ShieldCheck, Globe, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useTranslation } from "../hooks/useTranslation";

export default function PrivacySettingsPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.privacy_settings'));
    const navigate = useNavigate();
    const { user, updateUserSession, logout } = useAuth();
    const { showToast } = useToast();

    
    // We assume `is_private` is a boolean on the user object. If not present, default to false.
    const [isPrivate, setIsPrivate] = useState<boolean>(user?.is_private || false);
    const [loadingPrivacy, setLoadingPrivacy] = useState(false);
    
    // Deactivation state
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [deactivating, setDeactivating] = useState(false);

    const handleTogglePrivacy = async () => {
        const newValue = !isPrivate;
        setIsPrivate(newValue);
        
        try {
            setLoadingPrivacy(true);
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            
            const response = await axios.put("/api/v1/users/privacy", { is_private: newValue }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateUserSession({ ...user, is_private: newValue });
            
            showToast(newValue ? t("privacy_settings.success_private") : t("privacy_settings.success_public"), "success");
        } catch (error) {
            console.error("Failed to update privacy", error);
            setIsPrivate(!newValue); // Revert
            showToast(t("privacy_settings.update_failed"), "error");
        } finally {
            setLoadingPrivacy(false);
        }
    };

    const handleDeactivate = async () => {
        try {
            setDeactivating(true);
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            
            await axios.post("/api/v1/users/deactivate", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            showToast(t("privacy_settings.deactivate_success"), "success");
            setShowDeactivateDialog(false);
            
            setTimeout(() => {
                logout();
                navigate("/login");
            }, 1500);
            
        } catch (error) {
            console.error("Failed to deactivate account", error);
            showToast(t("privacy_settings.deactivate_failed"), "error");
            setShowDeactivateDialog(false);
        } finally {
            setDeactivating(false);
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
                        {t("privacy_settings.title")}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    <div className="space-y-6 mb-10">
                        {/* Section 1: Account Privacy */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                <h2 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100">
                                    {t("privacy_settings.account_privacy")}
                                </h2>
                            </div>

                            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {isPrivate ? (
                                            <Lock className="w-4 h-4 text-indigo-600 dark:text-primary" />
                                        ) : (
                                            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <h3 className="font-['Manrope'] font-bold text-[15px] text-gray-900 dark:text-gray-100">
                                            {isPrivate ? t("privacy_settings.account_private") : t("privacy_settings.account_public")}
                                        </h3>
                                    </div>
                                    <p className="font-['Manrope'] text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {isPrivate 
                                            ? t("privacy_settings.desc_private")
                                            : t("privacy_settings.desc_public")
                                        }
                                    </p>
                                </div>
                                <div className="pt-1 flex-shrink-0">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={isPrivate}
                                            onChange={handleTogglePrivacy}
                                            disabled={loadingPrivacy}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Account Deactivation */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <h2 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100">
                                    {t("privacy_settings.deactivate_title")}
                                </h2>
                            </div>
                            
                            <p className="font-['Manrope'] text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{__html: t("privacy_settings.deactivate_desc") }} />

                            <button
                                onClick={() => setShowDeactivateDialog(true)}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 py-3.5 rounded-xl font-['Lexend_Deca'] font-bold text-[14px] transition-colors"
                            >
                                {t("privacy_settings.deactivate_button")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeactivateDialog}
                onOpenChange={(open) => setShowDeactivateDialog(open)}
                onConfirm={handleDeactivate}
                title={t("privacy_settings.dialog_title")}
                description={t("privacy_settings.dialog_desc")}
                confirmText={deactivating ? t("privacy_settings.processing") : t("privacy_settings.yes_deactivate")}
                cancelText={t("privacy_settings.cancel")}
                variant="danger"
            />
        </MobileLayout>
    );
}
