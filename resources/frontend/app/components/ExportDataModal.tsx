import { useState } from "react";
import { DownloadCloud, X, FileText, Database, Users, AlertCircle } from "lucide-react";
import { CustomSelect } from "./ui/CustomSelect";
import * as XLSX from "xlsx";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "../hooks/useTranslation";
import { useLanguage } from "../contexts/LanguageContext";

interface ExportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    notesList: any[];
    reportsList: any[];
    usersList: any[];
    certsList: any[];
}

export function ExportDataModal({
    isOpen,
    onClose,
    notesList,
    reportsList,
    usersList,
    certsList,
}: ExportDataModalProps) {
    const [category, setCategory] = useState<"semua" | "catatan" | "laporan" | "users" | "sertifikasi">("semua");
    const [verifyStatus, setVerifyStatus] = useState<"semua" | "terverifikasi" | "belum">("semua");
    const [limit, setLimit] = useState<number>(0); // 0 means all
    const [format, setFormat] = useState<"csv" | "xlsx" | "json" | "pdf">("xlsx");
    const [isExporting, setIsExporting] = useState(false);
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { resolvedLanguage } = useLanguage();
    const lang = resolvedLanguage === 'id' ? 'id-ID' : resolvedLanguage;

    if (!isOpen) return null;

    const translateReason = (reason: string, tFn: any) => {
        switch (reason) {
            case "Spam":
            case "Spam / Promosi": 
            case "Spam pemasaran / Iklan mengganggu": return tFn("note_detail.report_reason_spam") || reason;
            
            case "Informasi Palsu":
            case "Informasi keliru / Misinformasi": return tFn("public_profile.report_reason_false_info") || reason;
            
            case "Konten Tidak Pantas": return tFn("note_detail.report_reason_inappropriate") || reason;
            
            case "Kata Kasar":
            case "Ujaran kebencian / Kata-kata kasar": return tFn("public_profile.report_reason_harsh_words") || reason;
            
            case "Pelecehan":
            case "Pelecehan / Ujaran Kebencian": 
            case "Pelecehan / Intimidasi terhadap user": return tFn("note_detail.report_reason_harassment") || reason;
            
            case "Hak Cipta":
            case "Pelanggaran Hak Cipta": 
            case "Pelanggaran Hak Cipta / Plagiasi": return tFn("note_detail.report_reason_copyright") || reason;
            
            case "Lainnya": 
            case "Alasan lainnya...": return tFn("note_detail.report_reason_other") || reason;
            
            default: return reason;
        }
    };

    const translateRole = (role: string, tFn: any) => {
        switch (role) {
            case "admin": return tFn("admin_dashboard.role_admin") || role;
            case "pakar": return tFn("admin_dashboard.role_expert") || role;
            case "user": return tFn("admin_dashboard.role_student") || role;
            default: return role;
        }
    };

    const translateSubject = (subject: string, tFn: any) => {
        if (!subject || subject === "-") return "-";
        const slug = subject.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
        const translated = tFn(`subjects.${slug}`);
        return translated !== `subjects.${slug}` ? translated : subject;
    };

    const translateClass = (cls: string, tFn: any) => {
        if (!cls || cls === "-") return "-";
        if (cls === "Umum") return tFn("auth_modal.role_umum") || "Umum";
        if (cls.startsWith("Kelas ")) return `${tFn("upload.class")} ${cls.replace("Kelas ", "")}`;
        return cls;
    };

    // --- Data Processing ---
    const getFilteredNotes = () => {
        let data = (notesList || []).slice();
        if (verifyStatus === "terverifikasi") data = data.filter((n) => n.isValidated || n.is_verified);
        else if (verifyStatus === "belum") data = data.filter((n) => !n.isValidated && !n.is_verified);
        if (limit > 0) data = data.slice(0, limit);
        return data.map((n) => ({
            [t("export_modal.col_title") || "Judul"]: String(n.title || "-"),
            [t("export_modal.col_author") || "Penulis"]: String(n.user?.name || n.author?.name || t("export_modal.anon") || "Anonim"),
            [t("export_modal.col_subject") || "Mata Pelajaran"]: translateSubject(String(n.mataPelajaran || n.mapel || "-"), t),
            [t("export_modal.col_class") || "Kelas"]: translateClass(String(n.kelas || "-"), t),
            [t("export_modal.col_status") || "Status"]: n.isValidated || n.is_verified ? (t("export_modal.verified") || "Terverifikasi") : (t("export_modal.not_verified") || "Belum"),
            [t("export_modal.col_date") || "Tanggal"]: new Date(n.created_at || n.createdAt || Date.now()).toLocaleDateString((lang === 'ar' ? 'ar-EG' : lang === 'fa' ? 'fa-IR' : lang)),
        }));
    };

    const getFilteredReports = () => {
        let data = (reportsList || []).slice();
        if (limit > 0) data = data.slice(0, limit);
        return data.map((r) => {
            let statusText = r.status;
            if (r.status === "pending") statusText = t("export_modal.status_pending") || "Menunggu";
            if (r.status === "resolved") statusText = t("export_modal.status_resolved") || "Selesai";
            if (r.status === "rejected") statusText = t("export_modal.status_rejected") || "Ditolak";
            
            return {
                [t("export_modal.col_target") || "Target"]: String(r.noteTitle || r.userName || "-"),
                [t("export_modal.col_reporter") || "Pelapor"]: String(r.reporter?.name || t("export_modal.anon") || "Anonim"),
                [t("export_modal.col_reason") || "Alasan"]: translateReason(String(r.reason || "-"), t),
                [t("export_modal.col_desc") || "Deskripsi"]: String(r.description || "-").substring(0, 100),
                [t("export_modal.col_status") || "Status"]: statusText,
                [t("export_modal.col_date") || "Tanggal"]: new Date(r.created_at || r.date || Date.now()).toLocaleDateString((lang === 'ar' ? 'ar-EG' : lang === 'fa' ? 'fa-IR' : lang)),
            };
        });
    };

    const getFilteredCerts = () => {
        let data = (certsList || []).slice();
        if (limit > 0) data = data.slice(0, limit);
        return data.map((c) => {
            let statusText = c.status;
            if (c.status === "pending") statusText = t("export_modal.status_pending") || "Menunggu";
            if (c.status === "approved") statusText = t("export_modal.status_approved") || "Disetujui";
            if (c.status === "rejected") statusText = t("export_modal.status_rejected") || "Ditolak";

            return {
                [t("export_modal.col_user_id") || "User ID"]: String(c.user_id || "-"),
                [t("export_modal.col_field") || "Bidang Keahlian"]: translateSubject(String(c.bidang_keahlian || "-"), t),
                [t("export_modal.col_status") || "Status"]: statusText,
                [t("export_modal.col_reject_reason") || "Alasan Penolakan"]: String(c.alasan_penolakan || "-"),
                [t("export_modal.col_date") || "Tanggal"]: new Date(c.created_at || Date.now()).toLocaleDateString((lang === 'ar' ? 'ar-EG' : lang === 'fa' ? 'fa-IR' : lang)),
            };
        });
    };

    const getFilteredUsers = () => {
        let data = (usersList || []).slice();
        if (verifyStatus === "terverifikasi") data = data.filter((u) => u.role !== "user");
        else if (verifyStatus === "belum") data = data.filter((u) => u.role === "user");
        if (limit > 0) data = data.slice(0, limit);
        return data.map((u) => ({
            [t("export_modal.col_name") || "Nama"]: String(u.name || "-"),
            [t("export_modal.col_email") || "Email"]: String(u.email || "-"),
            [t("export_modal.col_role") || "Role"]: translateRole(String(u.role || "-"), t),
            [t("export_modal.col_status") || "Status"]: u.role === "admin" || u.role === "pakar" ? (t("export_modal.verified") || "Terverifikasi") : (t("export_modal.regular") || "Reguler"),
            [t("export_modal.col_reg_date") || "Tanggal Daftar"]: new Date(u.created_at || Date.now()).toLocaleDateString((lang === 'ar' ? 'ar-EG' : lang === 'fa' ? 'fa-IR' : lang)),
        }));
    };

    // --- Helper: Build HTML table from array of objects ---
    const buildHtmlTable = (data: Record<string, string>[]) => {
        if (data.length === 0) return `<p style='color:#888;'>${t("export_modal.no_data") || "Tidak ada data."}</p>`;
        const headers = Object.keys(data[0]);
        let html = `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px;">`;
        html += `<thead><tr>`;
        headers.forEach((h) => {
            html += `<th style="border:1px solid #ddd;padding:8px 10px;background:#4f46e5;color:white;text-align:left;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">${h.replace(/_/g, " ")}</th>`;
        });
        html += `</tr></thead><tbody>`;
        data.forEach((row, i) => {
            const bgColor = i % 2 === 0 ? "#f9fafb" : "#ffffff";
            html += `<tr>`;
            headers.forEach((h) => {
                html += `<td style="border:1px solid #eee;padding:7px 10px;background:${bgColor};color:#333;">${row[h]}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        return html;
    };

    // --- Export Handlers ---
    const handleExportPDF = () => {
        const notes = category === "semua" || category === "catatan" ? getFilteredNotes() : [];
        const reports = category === "semua" || category === "laporan" ? getFilteredReports() : [];
        const users = category === "semua" || category === "users" ? getFilteredUsers() : [];
        const certs = category === "semua" || category === "sertifikasi" ? getFilteredCerts() : [];

        const totalRecords = notes.length + reports.length + users.length + certs.length;
        if (totalRecords === 0) {
            showToast(t("export_modal.no_data_filter") || "Tidak ada data yang sesuai filter untuk diekspor.", "warning");
            return;
        }

        const now = new Date().toLocaleString("id-ID");

        let bodyContent = `
            <div style="margin-bottom:30px;">
                <p style="color:#555;font-size:13px;line-height:1.6;">
                    ${t("export_modal.doc_info") || "Dokumen ini berisi"} <strong>${totalRecords}</strong> ${t("export_modal.doc_info2") || "data yang diekstrak dari platform Ba-Yu pada"} <strong>${now}</strong>.
                    ${category === "semua" ? (t("export_modal.doc_all_cat") || "Data mencakup seluruh kategori: Catatan, Laporan, dan Pengguna.") : `${t("export_modal.doc_only_cat") || "Data yang ditampilkan hanya kategori"} <strong>${category}</strong>.`}
                    ${verifyStatus !== "semua" ? ` ${t("export_modal.doc_filter_verify") || "Filter status verifikasi:"} <strong>${verifyStatus}</strong>.` : ""}
                    ${limit > 0 ? ` ${t("export_modal.doc_limit") || "Dibatasi maksimal"} <strong>${limit}</strong> ${t("export_modal.doc_limit2") || "data per kategori."}` : ""}
                </p>
            </div>
        `;

        if (notes.length > 0) {
            bodyContent += `
                <div style="margin-bottom:32px;">
                    <h2 style="font-size:18px;color:#1e1b4b;margin-bottom:6px;border-bottom:2px solid #4f46e5;padding-bottom:6px;">📝 ${t("export_modal.cat_notes") || "Catatan"} (${notes.length})</h2>
                    <p style="font-size:12px;color:#777;margin-bottom:12px;">${t("export_modal.notes_desc") || "Daftar materi catatan yang tersedia di platform."}</p>
                    ${buildHtmlTable(notes)}
                </div>
            `;
        }

        if (reports.length > 0) {
            bodyContent += `
                <div style="margin-bottom:32px;">
                    <h2 style="font-size:18px;color:#991b1b;margin-bottom:6px;border-bottom:2px solid #dc2626;padding-bottom:6px;">⚠️ ${t("export_modal.cat_reports") || "Laporan"} (${reports.length})</h2>
                    <p style="font-size:12px;color:#777;margin-bottom:12px;">${t("export_modal.reports_desc") || "Daftar laporan yang dikirim oleh pengguna."}</p>
                    ${buildHtmlTable(reports)}
                </div>
            `;
        }

        if (users.length > 0) {
            bodyContent += `
                <div style="margin-bottom:32px;">
                    <h2 style="font-size:18px;color:#065f46;margin-bottom:6px;border-bottom:2px solid #059669;padding-bottom:6px;">👤 ${t("export_modal.cat_users") || "Pengguna"} (${users.length})</h2>
                    <p style="font-size:12px;color:#777;margin-bottom:12px;">${t("export_modal.users_desc") || "Daftar pengguna terdaftar di platform."}</p>
                    ${buildHtmlTable(users)}
                </div>
            `;
        }

        if (certs.length > 0) {
            bodyContent += `
                <div style="margin-bottom:32px;">
                    <h2 style="font-size:18px;color:#86198f;margin-bottom:6px;border-bottom:2px solid #c026d3;padding-bottom:6px;">🎓 ${t("export_modal.cat_certs") || "Sertifikasi"} (${certs.length})</h2>
                    <p style="font-size:12px;color:#777;margin-bottom:12px;">${t("export_modal.certs_desc") || "Daftar pengajuan sertifikasi pakar."}</p>
                    ${buildHtmlTable(certs)}
                </div>
            `;
        }

        const htmlString = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Export Data Ba-Yu - ${now}</title>
                <style>
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .no-print { display: none; }
                    }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                </style>
            </head>
            <body>
                <div style="margin-bottom:24px;">
                    <h1 style="font-size:28px;color:#1e1b4b;margin-bottom:4px;">📊 ${t("export_modal.report_title") || "Laporan Ekspor Data Ba-Yu"}</h1>
                    <p style="color:#888;font-size:13px;">${t("export_modal.extracted_at") || "Diekstrak pada:"} ${now}</p>
                </div>
                <hr style="border:0;border-top:1px solid #e5e7eb;margin-bottom:24px;"/>
                ${bodyContent}
                <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;color:#aaa;font-size:11px;">
                    ${t("export_modal.footer_note") || "Ba-Yu Platform &mdash; Dokumen ini digenerate secara otomatis."}
                </div>
            </body>
            </html>
        `;

        if ((window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                type: 'DOWNLOAD_PDF',
                html: htmlString
            }));
            return;
        }

        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) {
            showToast(t("export_modal.print_failed") || "Gagal membuka jendela cetak. Pastikan pop-up diizinkan di browser kamu.", "error");
            return;
        }

        printWindow.document.write(htmlString + `
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 600);
                };
            </script>
        `);
        printWindow.document.close();
    };

    const handleExportSpreadsheet = (type: "xlsx" | "csv") => {
        const notes = category === "semua" || category === "catatan" ? getFilteredNotes() : [];
        const reports = category === "semua" || category === "laporan" ? getFilteredReports() : [];
        const users = category === "semua" || category === "users" ? getFilteredUsers() : [];
        const certs = category === "semua" || category === "sertifikasi" ? getFilteredCerts() : [];

        const totalRecords = notes.length + reports.length + users.length + certs.length;
        if (totalRecords === 0) {
            showToast(t("export_modal.no_data_filter") || "Tidak ada data yang sesuai filter untuk diekspor.", "warning");
            return;
        }

        const fileName = `Export_BaYu_${category}_${new Date().getTime()}`;
        const wb = XLSX.utils.book_new();

        if (notes.length > 0) {
            const ws = XLSX.utils.json_to_sheet(notes);
            XLSX.utils.book_append_sheet(wb, ws, "Catatan");
        }
        if (reports.length > 0) {
            const ws = XLSX.utils.json_to_sheet(reports);
            XLSX.utils.book_append_sheet(wb, ws, "Laporan");
        }
        if (users.length > 0) {
            const ws = XLSX.utils.json_to_sheet(users);
            XLSX.utils.book_append_sheet(wb, ws, "Pengguna");
        }
        if (certs.length > 0) {
            const ws = XLSX.utils.json_to_sheet(certs);
            XLSX.utils.book_append_sheet(wb, ws, "Sertifikasi");
        }

        if (type === "csv") {
            // CSV only supports single sheet, so merge all
            const allData = [
                ...notes.map(n => ({ ...n, Kategori: "Catatan" })),
                ...reports.map(r => ({ ...r, Kategori: "Laporan" })),
                ...users.map(u => ({ ...u, Kategori: "Pengguna" })),
                ...certs.map(c => ({ ...c, Kategori: "Sertifikasi" })),
            ];
            const ws = XLSX.utils.json_to_sheet(allData);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            if ((window as any).ReactNativeWebView) {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'DOWNLOAD_FILE',
                        filename: `${fileName}.csv`,
                        base64: reader.result
                    }));
                };
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${fileName}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } else {
            if ((window as any).ReactNativeWebView) {
                const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
                (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'DOWNLOAD_FILE',
                    filename: `${fileName}.xlsx`,
                    base64: base64
                }));
            } else {
                XLSX.writeFile(wb, `${fileName}.xlsx`);
            }
        }
    };

    const handleExportJSON = () => {
        const notes = category === "semua" || category === "catatan" ? getFilteredNotes() : [];
        const reports = category === "semua" || category === "laporan" ? getFilteredReports() : [];
        const users = category === "semua" || category === "users" ? getFilteredUsers() : [];
        const certs = category === "semua" || category === "sertifikasi" ? getFilteredCerts() : [];

        const totalRecords = notes.length + reports.length + users.length + certs.length;
        if (totalRecords === 0) {
            showToast(t("export_modal.no_data_filter") || "Tidak ada data yang sesuai filter untuk diekspor.", "warning");
            return;
        }

        const exportData = {
            metadata: {
                exported_at: new Date().toISOString(),
                category,
                verify_status: verifyStatus,
                limit: limit || "unlimited",
            },
            ...(notes.length > 0 && { catatan: notes }),
            ...(reports.length > 0 && { laporan: reports }),
            ...(users.length > 0 && { pengguna: users }),
            ...(certs.length > 0 && { sertifikasi: certs }),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        if ((window as any).ReactNativeWebView) {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'DOWNLOAD_FILE',
                    filename: `Export_BaYu_${category}_${new Date().getTime()}.json`,
                    base64: reader.result
                }));
            };
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Export_BaYu_${category}_${new Date().getTime()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            if (format === "pdf") handleExportPDF();
            else if (format === "xlsx") handleExportSpreadsheet("xlsx");
            else if (format === "csv") handleExportSpreadsheet("csv");
            else if (format === "json") handleExportJSON();

            setTimeout(() => {
                onClose();
                setIsExporting(false);
            }, 600);
        } catch (error) {
            console.error("Export failed:", error);
            showToast((t("export_modal.export_failed") || "Gagal melakukan ekspor data. Error: ") + (error as any)?.message, "error");
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="bg-white dark:bg-[#1C1A29] rounded-2xl w-full max-w-[540px] relative z-10 overflow-hidden shadow-xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white dark:bg-[#1C1A29] px-6 py-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300">
                            <DownloadCloud className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[16px] text-gray-900 dark:text-gray-100">{t("export_modal.title") || "Ekspor Data Dashboard"}</h3>
                            <p className="text-[13px] text-gray-500">{t("export_modal.desc") || "Filter dan unduh data secara komprehensif"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 mb-2">
                            {t("export_modal.category") || "Kategori Data"}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: "semua", label: t("export_modal.cat_all") || "Semua Data", icon: Database },
                                { id: "catatan", label: t("export_modal.cat_notes") || "Catatan", icon: FileText },
                                { id: "laporan", label: t("export_modal.cat_reports") || "Laporan", icon: AlertCircle },
                                { id: "users", label: t("export_modal.cat_users") || "Pengguna", icon: Users },
                                { id: "sertifikasi", label: t("export_modal.cat_certs") || "Sertifikasi", icon: FileText },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setCategory(opt.id as any)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border font-bold text-[13px] transition-all ${
                                        category === opt.id 
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1A29] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                    }`}
                                >
                                    <opt.icon className="w-4 h-4" />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Status Selection */}
                        <div>
                            <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 mb-2">
                                {t("export_modal.verify_status") || "Status Verifikasi"}
                            </label>
                            <CustomSelect
                                value={verifyStatus}
                                onChange={(val) => setVerifyStatus(val as any)}
                                options={[
                                    { value: "semua", label: t("export_modal.status_all") || "Semua Status" },
                                    { value: "terverifikasi", label: t("export_modal.status_verified") || "Hanya Terverifikasi" },
                                    { value: "belum", label: t("export_modal.status_unverified") || "Belum Terverifikasi" },
                                ]}
                            />
                        </div>

                        {/* Limit Selection */}
                        <div>
                            <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 mb-2">
                                {t("export_modal.data_limit") || "Batas Data"}
                            </label>
                            <CustomSelect
                                value={String(limit)}
                                onChange={(val) => setLimit(Number(val))}
                                options={[
                                    { value: "0", label: t("export_modal.limit_all") || "Semua Data (Unlimit)" },
                                    { value: "50", label: t("export_modal.limit_50") || "Maks. 50 Baris" },
                                    { value: "100", label: t("export_modal.limit_100") || "Maks. 100 Baris" },
                                    { value: "500", label: t("export_modal.limit_500") || "Maks. 500 Baris" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                        <label className="block text-[12px] font-bold text-gray-500 dark:text-gray-400 mb-2">
                            {t("export_modal.format") || "Format Berkas Output"}
                        </label>
                        <div className="flex gap-2">
                            {["xlsx", "pdf", "csv", "json"].map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => setFormat(fmt as any)}
                                    className={`flex-1 py-2.5 rounded-xl border font-bold text-[12px] uppercase transition-all ${
                                        format === fmt 
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1A29] text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                                    }`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-[#1C1A29] px-6 py-4 border-t border-gray-200 dark:border-white/10 flex gap-3 justify-end">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 font-bold text-[13px] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        {t("export_modal.cancel") || "Batal"}
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-[13px] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <DownloadCloud className="w-4 h-4" />
                        )}
                        {t("export_modal.export_now") || "Ekspor Sekarang"}
                    </button>
                </div>
            </div>
        </div>
    );
}
