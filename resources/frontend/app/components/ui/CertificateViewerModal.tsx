import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { jsPDF } from "jspdf";

interface CertificateViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    certUrl: string | null;
    userName?: string;
    bidangKeahlian?: string;
}

export function CertificateViewerModal({ isOpen, onClose, certUrl, userName = "User", bidangKeahlian = "Pakar" }: CertificateViewerModalProps) {
    const { t } = useTranslation();
    const [isDownloading, setIsDownloading] = useState(false);

    if (!certUrl) return null;

    const isPdf = certUrl.toLowerCase().endsWith(".pdf");
    const isImage = certUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!certUrl || isDownloading) return;

        try {
            setIsDownloading(true);
            const response = await fetch(certUrl);
            if (!response.ok) throw new Error("Gagal mengunduh file dari server");
            
            let blobUrl = "";
            let blob: Blob;

            if (isImage) {
                // Generate PDF locally using jsPDF if it's an image
                const imageBlob = await response.blob();
                
                // Read blob as data URL
                const base64data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageBlob);
                });

                // Load image to get dimensions
                const img = new Image();
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = reject;
                    img.src = base64data;
                });

                // Calculate PDF orientation and size based on image
                const orientation = img.width > img.height ? "l" : "p";
                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: "px",
                    format: [img.width, img.height]
                });
                
                pdf.addImage(base64data, 'JPEG', 0, 0, img.width, img.height);
                blob = pdf.output('blob');
            } else {
                // If it's already PDF, use it directly
                blob = await response.blob();
            }
            
            blobUrl = window.URL.createObjectURL(blob);
            
            const originalFile = certUrl.split('/').pop() || "sertifikat";
            const originalName = originalFile.split('.')[0] || "file";
            
            const safeName = `${userName}-${bidangKeahlian}-${originalName}`
                .replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff]/g, '_')
                .replace(/\s+/g, ' ');
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${safeName}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
            }, 1000);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Maaf, terjadi kesalahan saat memproses file. Pastikan koneksi stabil.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] bg-white/95 dark:bg-[#1C1A29]/95 backdrop-blur-xl border-white/20 dark:border-white/10 p-0 overflow-hidden shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] [&>button]:hidden">
                <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            {isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <DialogTitle className="text-xl font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 m-0">
                            {t("admin_dashboard.view_cert_title")}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30 dark:bg-black/20 flex items-center justify-center min-h-[400px]">
                    {isPdf ? (
                        <iframe
                            src={certUrl}
                            className="w-full h-[65vh] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-gray-900"
                            title="Certificate PDF Viewer"
                        />
                    ) : isImage ? (
                        <img
                            src={certUrl}
                            alt="Certificate"
                            className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-sm border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50 p-2"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8 text-center bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20">
                            <FileText size={48} className="mb-4 text-indigo-300 dark:text-indigo-500/50" />
                            <p className="font-['Manrope'] font-medium mb-4">
                                Preview not available for this file type.
                            </p>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={16} className={isDownloading ? "animate-bounce" : ""} />
                                {isDownloading ? "Mengunduh..." : t("admin_dashboard.view_cert_download")}
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 shrink-0 flex justify-end gap-3 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all font-['Manrope'] text-sm cursor-pointer"
                    >
                        {t("admin_dashboard.view_cert_close")}
                    </button>
                    {(isPdf || isImage) && (
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 font-['Manrope'] text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} className={isDownloading ? "animate-bounce" : ""} />
                            {isDownloading ? "Mengunduh..." : t("admin_dashboard.view_cert_download")}
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
