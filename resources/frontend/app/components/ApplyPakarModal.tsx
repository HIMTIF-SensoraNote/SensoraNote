import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../hooks/useTranslation";
import { X, UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";

interface ApplyPakarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ApplyPakarModal({ isOpen, onClose }: ApplyPakarModalProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        keahlian: "",
    });

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setFormData({
                name: user?.name || "",
                email: user?.email || "",
                keahlian: "",
            });
            setIsSubmitting(false);
            setIsSuccess(false);
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            showToast(
                t('apply_pakar.require_file') !== 'apply_pakar.require_file' ? t('apply_pakar.require_file') : "Harap unggah dokumen bukti (PDF/JPG) terlebih dahulu!",
                "warning",
            );
            return;
        }

        setIsSubmitting(true);

        const token =
            localStorage.getItem("bayu-token") ||
            sessionStorage.getItem("bayu-token");

        const dataToSend = new FormData();
        dataToSend.append("bidang_keahlian", formData.keahlian);
        dataToSend.append("file_sertifikat", file);

        try {
            await axios.post("/api/v1/sertifikasi", dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setIsSubmitting(false);
            setIsSuccess(true);

            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (error: any) {
            setIsSubmitting(false);
            showToast(
                error.response?.data?.message ||
                    (t('apply_pakar.error_submit') !== 'apply_pakar.error_submit' ? t('apply_pakar.error_submit') : "Gagal mengirim pengajuan. Pastikan file maksimal 5MB."),
                "error",
            );
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 5 * 1024 * 1024) {
                showToast(t('apply_pakar.file_too_large') !== 'apply_pakar.file_too_large' ? t('apply_pakar.file_too_large') : "Ukuran file tidak boleh lebih dari 5MB!", "error");
                e.target.value = "";
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={
                            !isSubmitting && !isSuccess ? onClose : undefined
                        }
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#1C1A29] border border-slate-200 dark:border-white/10 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {!isSubmitting && !isSuccess && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors z-[70]"
                                >
                                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                            )}

                            {isSuccess ? (
                                <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            damping: 12,
                                        }}
                                        className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold font-['Lexend_Deca'] text-gray-900 dark:text-gray-100 mb-2">
                                        {t('apply_pakar.success_title') !== 'apply_pakar.success_title' ? t('apply_pakar.success_title') : 'Berhasil Terkirim!'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-['Manrope']">
                                        {t('apply_pakar.success_desc') !== 'apply_pakar.success_desc' ? t('apply_pakar.success_desc') : 'Sertifikat Anda sedang ditinjau oleh pihak Admin.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                                        <h2 className="text-xl md:text-2xl font-bold font-['Lexend_Deca'] text-gray-900 dark:text-gray-100">
                                            {t('apply_pakar.title') !== 'apply_pakar.title' ? t('apply_pakar.title') : 'Sertifikasi Pakar'}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-['Manrope'] mt-2 leading-relaxed">
                                            {t('apply_pakar.description') !== 'apply_pakar.description' ? t('apply_pakar.description') : 'Unggah portofolio/sertifikat yang membuktikan keahlian Anda agar bisa divalidasi sebagai Pakar Pendidikan.'}
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="p-6 md:p-8 space-y-5"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 font-['Manrope']">
                                                {t('apply_pakar.full_name') !== 'apply_pakar.full_name' ? t('apply_pakar.full_name') : 'Nama Lengkap'}
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-xl focus:border-primary focus:bg-white dark:focus:bg-[#13111C] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 font-['Manrope']">
                                                {t('apply_pakar.education_expertise') !== 'apply_pakar.education_expertise' ? t('apply_pakar.education_expertise') : 'Pendidikan Terakhir / Keahlian'}
                                            </label>
                                            <input
                                                type="text"
                                                name="keahlian"
                                                value={formData.keahlian}
                                                onChange={handleChange}
                                                placeholder={t('apply_pakar.education_placeholder') !== 'apply_pakar.education_placeholder' ? t('apply_pakar.education_placeholder') : "Contoh: S1 Matematika Murni"}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-xl focus:border-primary focus:bg-white dark:focus:bg-[#13111C] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 font-['Manrope']">
                                                {t('apply_pakar.upload_document') !== 'apply_pakar.upload_document' ? t('apply_pakar.upload_document') : 'Unggah Bukti Dokumen (Sertifikat/Ijazah)'}
                                            </label>
                                            <div className="mt-1 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl px-6 pt-5 pb-6 flex justify-center hover:border-primary dark:hover:border-primary transition-colors hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer relative bg-gray-50/50 dark:bg-black/10">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept=".pdf,.jpg,.jpeg"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                                <div className="space-y-1 text-center pointer-events-none">
                                                    <UploadCloud className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                    <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                                                        <span className="relative rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                                                            {file
                                                                ? file.name
                                                                : (t('apply_pakar.choose_file') !== 'apply_pakar.choose_file' ? t('apply_pakar.choose_file') : "Pilih File PDF/JPG")}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {t('apply_pakar.max_size') !== 'apply_pakar.max_size' ? t('apply_pakar.max_size') : 'Maks. ukuran 5MB'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-[13px] uppercase tracking-wider font-['Lexend_Deca'] shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        {t('apply_pakar.submit') !== 'apply_pakar.submit' ? t('apply_pakar.submit') : 'Kirim Pengajuan'}
                                                        <FileText className="w-4 h-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
