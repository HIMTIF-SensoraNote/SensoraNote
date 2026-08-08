import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { useParams, Link, useNavigate, useLocation } from "react-router";
import {
    ArrowLeft,
    Share2,
    Bookmark,
    Heart,
    Download,
    MessageCircle,
    Flag,
    Check,
    Star,
    LogIn,
    ArrowUp,
    Calendar,
    Clock,
    ShieldCheck,
    MoreHorizontal,
    Trash2,
    Facebook,
    Twitter,
    Link2,
    Send,
    Instagram,
    FileText,
    Loader2,
    MessageSquare,
    X,
    Pencil,
    Highlighter,
    Lock as LockIcon,
} from "lucide-react";
import {
    getNoteById,
    getUserById,
    getCommentsByNoteId,
    mockNotes,
    mataPelajaran,
} from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import { AuthModal } from "../components/auth-modal";
import { useToast } from "../contexts/ToastContext";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { CustomSelect } from "../components/ui/CustomSelect";
// @ts-ignore
import "react-quill/dist/quill.snow.css";
// @ts-ignore // Just in case, though we apply custom styles
import "katex/dist/katex.min.css";
import axios from "axios";
import { ArticleSkeleton } from "../components/ui/skeletons";
import { TagList } from "../components/ui/TagList";
import { DefaultThumbnail, AvatarImage } from "../components/ui/DefaultImages";
import { useTranslation } from '../hooks/useTranslation';
import { formatEducationLevel } from '../utils/formatEducationLevel';
import { NoteCard } from "../components/NoteCard";
export default function NoteDetailPage() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.note_detail'));
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { showToast } = useToast();
    const [liked, setLiked] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [replyingTo, setReplyingTo] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [replyText, setReplyText] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(
        null,
    );
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowPending, setIsFollowPending] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
    // Mobile drawer states
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
    


    const [isCheckingToken, setIsCheckingToken] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    
    // Phase 3: Interactive Respond State
    const [selectedText, setSelectedText] = useState("");
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const [quoteContext, setQuoteContext] = useState("");
    const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});

    // Phase 4: Personal Highlight State
    const [highlights, setHighlights] = useState<any[]>([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
    const [selectionRange, setSelectionRange] = useState<Range | null>(null);
    const HIGHLIGHT_COLORS: Record<string, { bg: string; darkBg: string; label: string }> = {
        yellow: { bg: "var(--hl-yellow)", darkBg: "var(--hl-yellow)", label: "Kuning" },
        green:  { bg: "var(--hl-green)", darkBg: "var(--hl-green)", label: "Hijau" },
        blue:   { bg: "var(--hl-blue)", darkBg: "var(--hl-blue)", label: "Biru" },
        red:    { bg: "var(--hl-red)", darkBg: "var(--hl-red)", label: "Merah" },
        purple: { bg: "var(--hl-purple)", darkBg: "var(--hl-purple)", label: "Ungu" },
    };

    const handleDownloadPDF = () => {
        const contentContainer = document.getElementById("area-materi-pdf");
        if (!contentContainer) return;

        let exportHtml = "";
        const qlEditor = contentContainer.querySelector('.ql-editor');
        const rawHtmlToExport = qlEditor ? qlEditor.innerHTML : processedContent;

        if (note?.is_restricted) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = rawHtmlToExport;
            
            // Truncate to first 3 child elements to ensure security in PDF export
            const children = Array.from(tempDiv.children).slice(0, 3);
            exportHtml = children.map(c => c.outerHTML).join("");
            exportHtml += "<p style='color: #94a3b8; font-style: italic; margin-top: 20px; font-weight: bold;'>[ ... Sisa materi disembunyikan dalam mode pratinjau ... ]</p>";
        } else {
            exportHtml = rawHtmlToExport;
        }

        if ((window as any).ReactNativeWebView) {
            // Include styling for WebView PDF export
            const styledHtml = `
              <!DOCTYPE html>
              <html lang="id">
                  <head>
                      <meta charset="UTF-8">
                      <title>${note?.title || "Materi Catatan"} - Ba-Yu</title>
                      <style>
                          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Lexend+Deca:wght@400;600;800&display=swap');
                          body { font-family: 'Manrope', sans-serif; line-height: 1.6; color: #1f2937; padding: 2cm; }
                          h1, h2, h3 { font-family: 'Lexend Deca', sans-serif; color: #111827; }
                          img { display: block; margin: 0 auto; max-width: 100%; height: auto; border-radius: 8px; }
                          pre { background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; }
                          code { font-family: monospace; }
                          blockquote { border-left: 4px solid #4f46e5; padding-left: 15px; color: #4b5563; font-style: italic; }
                      </style>
                  </head>
                  <body>
                      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px;">
                          <h1 style="margin-bottom: 10px; font-size: 28px;">${note?.title || "Catatan"}</h1>
                          <p style="color: #6b7280; font-size: 14px;">Mata Pelajaran: ${note?.mapel || "-"} | Diunggah pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div style="font-size: 14px;">
                          ${exportHtml}
                      </div>
                  </body>
              </html>
            `;
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                type: 'DOWNLOAD_PDF',
                html: styledHtml
            }));
            return;
        }

        const printWindow = window.open('', '', 'width=900,height=800');
        if (!printWindow) {
            showToast("Gagal membuka jendela cetak. Pastikan pop-up diizinkan.", "error");
            return;
        }

        const dateStr = new Date().toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { year: 'numeric', month: 'long', day: 'numeric' });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <title>${note?.title || "Materi Catatan"} - Ba-Yu</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Lexend+Deca:wght@400;600;800&display=swap');
                        
                        :root {
                            --primary: #4f46e5;
                            --text-main: #1f2937;
                            --text-muted: #6b7280;
                            --bg-color: #ffffff;
                        }

                        @page {
                            margin: 2cm;
                            size: A4 portrait;
                        }

                        body { 
                            font-family: 'Manrope', sans-serif; 
                            line-height: 1.6; 
                            color: var(--text-main); 
                            background: var(--bg-color);
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }

                        h1, h2, h3, h4 { font-family: 'Lexend Deca', sans-serif; color: #111827; }
                        
                        img { 
                            display: block; 
                            margin: 0 auto; 
                            max-width: 100%; 
                            height: auto; 
                            border-radius: 12px; 
                            page-break-inside: avoid;
                        }

                        .header {
                            text-align: center;
                            margin-bottom: 2rem;
                            padding-bottom: 1.5rem;
                            border-bottom: 2px solid #f3f4f6;
                        }

                        .header h1 { 
                            font-family: 'Lexend Deca', sans-serif;
                            font-size: 24pt; 
                            font-weight: 800;
                            color: #111827; 
                            margin: 0 0 0.5rem 0;
                            line-height: 1.2;
                            letter-spacing: -0.02em;
                        }

                        .meta {
                            font-size: 10pt;
                            color: var(--text-muted);
                            display: flex;
                            justify-content: center;
                            gap: 1rem;
                            font-weight: 500;
                        }

                        .content {
                            max-width: 100%;
                        }

                        /* Typography */
                        h2, h3, h4 { 
                            font-family: 'Lexend Deca', sans-serif;
                            color: #111827;
                            margin-top: 1.5em; 
                            margin-bottom: 0.5em; 
                            page-break-after: avoid;
                        }
                        h2 { font-size: 18pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
                        h3 { font-size: 14pt; }
                        p { margin-bottom: 1.2em; text-align: justify; }
                        
                        /* Elements */
                        img { 
                            max-width: 100%; 
                            height: auto; 
                            border-radius: 8px; 
                            margin: 1.5em auto;
                            display: block;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                            page-break-inside: avoid;
                        }
                        
                        blockquote {
                            border-left: 4px solid var(--primary);
                            background: #f8fafc;
                            padding: 1rem 1.5rem;
                            margin: 1.5rem 0;
                            font-style: italic;
                            color: #475569;
                            border-radius: 0 8px 8px 0;
                            page-break-inside: avoid;
                        }

                        pre { 
                            background: #1e293b; 
                            color: #f8fafc;
                            padding: 1.2rem; 
                            border-radius: 8px; 
                            overflow-x: auto; 
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 9.5pt;
                            page-break-inside: avoid;
                        }
                        
                        code { 
                            font-family: 'Courier New', Courier, monospace; 
                            background: #f1f5f9;
                            padding: 0.2em 0.4em;
                            border-radius: 4px;
                            color: #ef4444;
                            font-size: 0.9em;
                        }

                        ul, ol { padding-left: 1.5em; margin-bottom: 1.2em; }
                        li { margin-bottom: 0.5em; }

                        .footer {
                            margin-top: 3rem;
                            padding-top: 1rem;
                            border-top: 1px solid #e5e7eb;
                            text-align: center;
                            font-size: 9pt;
                            color: var(--text-muted);
                        }

                        .footer-brand {
                            font-family: 'Lexend Deca', sans-serif;
                            font-weight: 800;
                            color: var(--primary);
                        }

                        /* Highlight Styles */
                        .highlight-respond { background-color: transparent !important; color: inherit !important; }
                        
                        mark.user-highlight {
                            border-radius: 2px;
                            padding: 0 2px;
                            color: inherit;
                        }
                        mark.user-highlight[data-color="yellow"] { background-color: rgba(254, 240, 138, 0.8) !important; }
                        mark.user-highlight[data-color="green"] { background-color: rgba(134, 239, 172, 0.8) !important; }
                        mark.user-highlight[data-color="blue"] { background-color: rgba(147, 197, 253, 0.8) !important; }
                        mark.user-highlight[data-color="red"] { background-color: rgba(252, 165, 165, 0.8) !important; }
                        mark.user-highlight[data-color="purple"] { background-color: rgba(196, 181, 253, 0.8) !important; }

                        /* Remove tooltip UI from print */
                        .highlight-tooltip { display: none !important; }
                        
                        /* RTL Support */
                        body[dir="rtl"] { text-align: right; }
                        body[dir="rtl"] .header h1, body[dir="rtl"] h2, body[dir="rtl"] h3, body[dir="rtl"] h4, body[dir="rtl"] p { text-align: right; }
                        body[dir="rtl"] ul, body[dir="rtl"] ol { padding-left: 0; padding-right: 1.5em; }
                        body[dir="rtl"] blockquote { border-left: none; border-right: 4px solid var(--primary); border-radius: 8px 0 0 8px; }
                        body[dir="rtl"] pre, body[dir="rtl"] code { direction: ltr !important; text-align: left !important; }
                    </style>
                </head>
                <body dir="${isContentRtl ? 'rtl' : 'ltr'}">
                    <div class="header">
                        <h1>${note?.title || "Materi Catatan"}</h1>
                        <div class="meta">
                            <span>${t("note_detail.written_by") || "Ditulis oleh:"} ${author?.name || author?.username || "Penulis"}</span>
                            <span>&bull;</span>
                            <span>${t("note_detail.downloaded_at") || "Diunduh:"} ${dateStr}</span>
                        </div>
                    </div>
                    
                    <div class="content">
                        ${exportHtml}
                    </div>

                    ${note?.is_restricted ? `
                    <div style="margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-family: 'Lexend Deca', sans-serif; font-size: 14pt;">${t("note_detail.pdf_restricted_title") || "Materi Terproteksi"}</h4>
                        <p style="margin: 0; color: #475569; font-size: 10.5pt; font-family: 'Manrope', sans-serif;">
                            ${(t("note_detail.pdf_restricted_desc") || "Versi PDF ini hanya memuat sebagian materi. Ikuti penulis <b>@{author}</b> di aplikasi Ba-Yu untuk mengunduh versi lengkapnya.").replace('{author}', author?.username || 'penulis')}
                        </p>
                    </div>
                    ` : ''}

                    <div class="footer">
                        ${t("note_detail.pdf_footer") || 'Dokumen ini diunduh dari <span class="footer-brand">Ba-Yu</span> - Platform Belajar Masa Depan'}
                    </div>
                    
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 800);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Phase 3: Highlight Detection Effect
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                if (showHighlightMenu) {
                    // Beri delay sedikit agar user bisa klik tombol menu sebelum menu hilang
                    setTimeout(() => setShowHighlightMenu(false), 200);
                }
                return;
            }

            const range = selection.getRangeAt(0);
            const container = document.getElementById("area-materi-pdf");
            
            // Cek apakah teks yang diseleksi berada di dalam container materi
            if (container && container.contains(range.commonAncestorContainer)) {
                const text = selection.toString().trim();
                if (text.length > 0) {
                    const rect = range.getBoundingClientRect();
                    setSelectionRange(range);
                    setSelectionRect(rect);
                    setSelectedText(text);
                    setShowHighlightMenu(true);
                }
            } else {
                setShowHighlightMenu(false);
            }
        };

        document.addEventListener("mouseup", handleSelection);
        document.addEventListener("touchend", handleSelection);
        document.addEventListener("selectionchange", handleSelection);
        return () => {
            document.removeEventListener("mouseup", handleSelection);
            document.removeEventListener("touchend", handleSelection);
            document.removeEventListener("selectionchange", handleSelection);
        };
    }, [showHighlightMenu]);

    const handleRespondClick = () => {
        setShowHighlightMenu(false);
        setQuoteContext(selectedText);
        setIsCommentDrawerOpen(true);
    };

    // Phase 4: Highlight Helper Functions
    const getTextOffset = (container: Node, targetNode: Node, targetOffset: number): number => {
        try {
            const range = document.createRange();
            range.selectNodeContents(container);
            range.setEnd(targetNode, targetOffset);
            return range.toString().length;
        } catch (e) {
            console.warn("getTextOffset failed", e);
            return 0;
        }
    };

    const applyHighlightsToDOM = (highlightData: any[]) => {
        const container = document.getElementById("area-materi-pdf");
        if (!container) return;

        // Remove existing highlights first
        container.querySelectorAll("mark.user-highlight").forEach((mark) => {
            const parent = mark.parentNode;
            if (parent) {
                while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
                parent.removeChild(mark);
                parent.normalize();
            }
        });

        if (highlightData.length === 0) return;

        // Sort by start_offset descending so we apply from end to start (avoids offset shifting)
        const sorted = [...highlightData].sort((a, b) => b.start_offset - a.start_offset);
        const isDark = document.documentElement.classList.contains("dark");

        sorted.forEach((hl) => {
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            let charCount = 0;
            let node: Node | null;
            const startOffset = hl.start_offset;
            const endOffset = hl.end_offset;
            const colorInfo = HIGHLIGHT_COLORS[hl.color] || HIGHLIGHT_COLORS.yellow;

            const operations: { node: Node; rangeStart: number; rangeEnd: number }[] = [];

            while ((node = walker.nextNode())) {
                const textLen = (node.textContent || "").length;
                const nodeStart = charCount;
                const nodeEnd = charCount + textLen;

                if (nodeEnd <= startOffset) {
                    charCount = nodeEnd;
                    continue;
                }
                if (nodeStart >= endOffset) break;

                const rangeStart = Math.max(startOffset - nodeStart, 0);
                const rangeEnd = Math.min(endOffset - nodeStart, textLen);

                operations.push({ node, rangeStart, rangeEnd });
                charCount = nodeEnd;
            }

            operations.reverse().forEach(({ node, rangeStart, rangeEnd }) => {
                try {
                    const range = document.createRange();
                    range.setStart(node, rangeStart);
                    range.setEnd(node, rangeEnd);

                    const mark = document.createElement("mark");
                    mark.className = "user-highlight";
                    mark.dataset.highlightId = hl._id || hl.id;
                    mark.dataset.color = hl.color || "yellow";
                    mark.style.backgroundColor = colorInfo.bg;
                    mark.style.cursor = "pointer";
                    mark.style.transition = "background-color 0.2s";

                    mark.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const hlId = mark.dataset.highlightId;
                        setActiveHighlightId(activeHighlightId === hlId ? null : hlId || null);
                    });

                    range.surroundContents(mark);
                } catch (err) {
                    console.warn("Highlight apply skipped for segment:", err);
                }
            });
        });
    };

    const fetchHighlights = async () => {
        if (!isAuthenticated || !id) return;
        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const res = await axios.get(`/api/v1/posts/${id}/highlights`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHighlights(res.data.data || []);
        } catch (e) {
            console.error("Gagal memuat highlights", e);
        }
    };

    const handleHighlightClick = async (color: string) => {
        setShowHighlightMenu(false);
        setShowColorPicker(false);
        if (!isAuthenticated) return openAuthModal("login");
        if (!selectionRange) return;

        const container = document.getElementById("area-materi-pdf");
        if (!container) return;

        const startOff = getTextOffset(container, selectionRange.startContainer, selectionRange.startOffset);
        const endOff = getTextOffset(container, selectionRange.endContainer, selectionRange.endOffset);
        const text = selectionRange.toString().trim();

        if (!text || startOff === endOff) return;

        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const res = await axios.post(
                `/api/v1/posts/${id}/highlights`,
                { text, start_offset: startOff, end_offset: endOff, color },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const newHl = res.data.data;
            setHighlights((prev) => {
                // Replace if merged, add if new
                const filtered = prev.filter((h) => (h._id || h.id) !== (newHl._id || newHl.id));
                return [...filtered, newHl];
            });
            window.getSelection()?.removeAllRanges();
            showToast(t("note_detail.highlight_success"), "success");
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.message || t("note_detail.highlight_failed"), "error");
        }
    };

    const handleDeleteHighlight = async (highlightId: string) => {
        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            await axios.delete(`/api/v1/highlights/${highlightId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHighlights((prev) => prev.filter((h) => (h._id || h.id) !== highlightId));
            setActiveHighlightId(null);
            showToast(t("note_detail.highlight_delete_success"), "success");
        } catch (e: any) {
            console.error(e);
            showToast(t("note_detail.highlight_delete_failed"), "error");
        }
    };



    const handleShare = () => {
        if ((window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SHARE_URL',
                title: note?.title || "Catatan Ba-Yu",
                url: window.location.href
            }));
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: note?.title || "Catatan Ba-Yu",
                url: window.location.href
            }).catch(() => setShowShareModal(true));
        } else {
            setShowShareModal(true);
        }
    };

    const handleFollowToggle = async () => {
        if (!isAuthenticated) return openAuthModal("login");
        if (!author) return;

        if (isFollowing) {
            setConfirmConfig({
                isOpen: true,
                title: "Berhenti Mengikuti?",
                description: `Yakin ingin berhenti mengikuti ${author.name || author.username}?`,
                variant: "danger",
                onConfirm: () => processFollowToggle()
            });
        } else if (isFollowPending) {
            setConfirmConfig({
                isOpen: true,
                title: "Batalkan Permintaan?",
                description: `Batalkan permintaan mengikuti ke ${author.name || author.username}?`,
                variant: "danger",
                onConfirm: () => processFollowToggle()
            });
        } else {
            processFollowToggle();
        }
    };

    const processFollowToggle = async () => {
        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const authorId = author._id || author.id;
            
            const res = await axios.post(`/api/v1/users/${authorId}/follow`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { status, message } = res.data;
            
            if (status === 'accepted') {
                setIsFollowing(true);
                setIsFollowPending(false);
                setFollowerCount(prev => prev + 1);
            } else if (status === 'pending') {
                setIsFollowing(false);
                setIsFollowPending(true);
            } else if (status === 'unfollowed') {
                if (isFollowing) setFollowerCount(prev => Math.max(0, prev - 1));
                setIsFollowing(false);
                setIsFollowPending(false);
            }

            showToast(message, "success");
        } catch (error: any) {
            showToast(error.response?.data?.message || "Gagal memproses permintaan", "error");
        }
    };

    const [showReportModal, setShowReportModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: "danger" | "primary";
        cancelText?: string;
        confirmText?: string;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => {},
    });
    const [reportTarget, setReportTarget] = useState<{
        type: "note" | "comment";
        id: string;
        title?: string;
    } | null>(null);

    const [note, setNote] = useState<any>(null);
    const [author, setAuthor] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [validator, setValidator] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [commentSort, setCommentSort] = useState<"newest" | "oldest" | "top">("newest");

    // Auto-detect RTL based on note content
    const isContentRtl = note ? /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/.test((note.title || "") + " " + (note.content || "")) : false;

    // Handle comment hash scrolling from notifications
    useEffect(() => {
        if (location.hash && location.hash.startsWith('#comment-')) {
            // Buka drawer komentar
            setIsCommentDrawerOpen(true);
            
            // Tunggu drawer kebuka & komentar ke-render, baru scroll
            const timer = setTimeout(() => {
                const commentId = location.hash.substring(1);
                const element = document.getElementById(commentId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    
                    // Highlight the comment briefly
                    element.classList.add("ring-2", "ring-indigo-500", "ring-offset-2", "bg-indigo-50", "dark:bg-indigo-500/10");
                    setTimeout(() => {
                        element.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2", "bg-indigo-50", "dark:bg-indigo-500/10");
                    }, 2500);
                }
            }, 600); // Waktu cukup untuk animasi drawer
            
            return () => clearTimeout(timer);
        }
    }, [location.hash, comments.length]);

    const [recommendedNotes, setRecommendedNotes] = useState<any[]>([]);
    const [moreFromAuthor, setMoreFromAuthor] = useState<any[]>([]);

    useEffect(() => {
        if (!note || !author) return;

        const fetchRecommendations = async () => {
            try {
                // Gunakan kata kunci mapel untuk mencari referensi
                const recRes = await axios.get("/api/v1/posts", {
                    params: { search: note.mataPelajaran || note.mapel, sort: "populer" }
                });
                let recs = recRes.data.data || [];
                recs = recs.filter((n: any) => (n.id || n._id) !== note.id).slice(0, 4);
                setRecommendedNotes(recs);

                // Jika ada parameter user_id di API bisa dipakai, tapi kita bisa search by name
                const authorRes = await axios.get("/api/v1/posts", {
                    params: { search: author.name, sort: "terbaru" }
                });
                let authors = authorRes.data.data || [];
                authors = authors.filter((n: any) => (n.id || n._id) !== note.id && ((n.user?.id || n.userId || n.author?.id) === author.id)).slice(0, 4);
                setMoreFromAuthor(authors);

            } catch (err) {
                console.error("Gagal mengambil rekomendasi", err);
            }
        };

        fetchRecommendations();
    }, [note?.id, author?.id]);

    // Update Meta Tags for Social Preview (Open Graph)
    useEffect(() => {
        if (!note) return;

        const title = `${note.title} | Ba-Yu`;
        const description =
            note.content?.replace(/<[^>]*>/g, "").substring(0, 160) ||
            "Baca catatan belajar menarik di Ba-Yu!";
        const url = window.location.href;
        const image = note.thumbnail || "/logo.png"; // Fallback to logo

        // Update document title
        document.title = title;

        // Helper to update or create meta tags
        const updateMeta = (
            name: string,
            content: string,
            property = false,
        ) => {
            const attr = property ? "property" : "name";
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute("content", content);
        };

        updateMeta("description", description);
        updateMeta("og:title", title, true);
        updateMeta("og:description", description, true);
        updateMeta("og:url", url, true);
        updateMeta("og:image", image, true);
        updateMeta("og:type", "article", true);
        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", title);
        updateMeta("twitter:description", description);
        updateMeta("twitter:image", image);


        return () => {
            // Optional: Reset meta tags on unmount if needed
        };
    }, [note]);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    useEffect(() => {
        if (!note || !note.id || !isAuthenticated) return;

        const startTime = Date.now();
        console.log("Mulai baca catatan:", note.title);

        return () => {
            const endTime = Date.now();
            
            const timeSpentInSeconds = Math.floor((endTime - startTime) / 1000);
            const timeSpentInMinutes = Math.ceil(timeSpentInSeconds / 60);

            console.log(`Selesai baca. Durasi: ${timeSpentInMinutes} menit`);

            if (timeSpentInMinutes > 0) {
                const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
                
                fetch('/api/v1/learn/history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        post_id: note.id,
                        duration: timeSpentInMinutes
                    }),
                    keepalive: true
                }).catch(err => console.error("Gagal nyimpen histori:", err));
            }
        };
    }, [note, isAuthenticated]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");

    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith("#comment-") && comments.length > 0) {
            // Auto open comment drawer because the comment might not be in the top 2
            setIsCommentDrawerOpen(true);
            
            setTimeout(() => {
                const elId = hash.slice(1);
                // Because there are two identical IDs (one in main page, one in drawer),
                // we should select the one inside the drawer to be safe
                const drawer = document.querySelector('.fixed.top-\\[130px\\]');
                const el = drawer ? drawer.querySelector(`#${elId}`) : document.getElementById(elId);
                
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.classList.add(
                        "bg-indigo-50",
                        "dark:bg-indigo-500/20",
                        "transition-colors",
                        "duration-1000",
                    );
                    setTimeout(
                        () => el.classList.remove("bg-indigo-50", "dark:bg-indigo-500/20"),
                        3000,
                    );
                }
            }, 600); // wait for drawer animation (500ms) to complete
        }
    }, [comments, window.location.hash]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get("view") === "review") {
            setIsReviewModalOpen(true);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchNoteDetail = async () => {
            if (!id) return;
            try {
                const token =
                    localStorage.getItem("bayu-token") ||
                    sessionStorage.getItem("bayu-token");

                const response = await axios.get(`/api/v1/posts/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const n = response.data.data;

                setLiked(n.is_liked === true);

                setNote({
                    ...n,
                    id: n._id || n.id,
                    title: n.title,
                    content: n.content,
                    createdAt: n.created_at
                        ? (() => {
                              let d = new Date(n.created_at);
                              if (isNaN(d.getTime()) && typeof n.created_at === 'string') {
                                  d = new Date(n.created_at.replace(' ', 'T'));
                              }
                              return isNaN(d.getTime()) ? "" : d.toISOString();
                          })()
                        : "",
                    thumbnail: n.thumbnail || null,
                    mataPelajaran: n.mapel || "Umum",
                    jenjang: n.jenjang || "-",
                    kelas: n.kelas || "-",
                    semester: n.semester || "-",
                    isValidated: n.is_verified,
                    likes: n.likes_count || 0,
                    comments: n.comments_count || 0,
                    views: n.views || 0,
                    verify_reason: n.verify_reason || n.reason || "",
                    rating: n.rating || 0,
                    description: n.content
                        ? n.content
                              .replace(/<[^>]*>?/gm, "")
                              .substring(0, 150) + "..."
                        : "",
                });

                setAuthor(
                    n.user
                        ? {
                              ...n.user,
                              avatar: n.user.avatar || null,
                              role: n.user.role || "siswa",
                              followers_count: n.user.followers_count || 0,
                              is_followed_by_me:
                                  n.user.is_followed_by_me || false,
                              totalCatatan: n.user.totalCatatan || n.user.posts_count || 0,
                              followers: n.user.followers_count || 0,
                          }
                        : {
                              name: "Anonim",
                              avatar: null,
                              role: "siswa",
                              totalCatatan: 0,
                              followers: 0,
                          },
                );

                // Handle comments logic if available, for now map simple
                setComments(n.comments || []);

                if (user && n.likes) {
                    const isLiked = n.likes.some(
                        (l: any) =>
                            l.user_id === user.id || l.user_id === user._id,
                    );
                    setLiked(isLiked);
                }

                if (n.is_verified) {
                    const v = n.verified_by_user || n.validator || {};
                    setValidator({
                        id: v._id || v.id || null,
                        name: v.name || "Tim Pakar Ba-Yu",
                        avatar: v.avatar || null,
                    });
                }
            } catch (err) {
                console.error("Error fetching note", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNoteDetail();
        fetchHighlights();
    }, [id, isAuthenticated]);

    useEffect(() => {
        if (!isLoading && location.hash === "#comments-section") {
            setTimeout(() => {
                const commentsSection =
                    document.getElementById("comments-section");
                if (commentsSection) {
                    commentsSection.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    }, [isLoading, location.hash]);

    useEffect(() => {
        if (author) {
            setFollowerCount(author.followers_count || 0);
            setIsFollowing(author.is_followed_by_me || false);
            setIsFollowPending(author.is_follow_pending || false);
        }
    }, [author]);

    const openAuthModal = (tab: "login" | "register") => {
        setAuthTab(tab);
        setShowAuthModal(true);
    };

    const requireAuth = (action: () => void) => {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }
        action();
    };

    const SkeletonContainer = isAuthenticated
        ? ({ children }: { children: React.ReactNode }) => (
              <MobileLayout showBottomNav={false} hideMobileTopNav={true}>{children}</MobileLayout>
          )
        : ({ children }: { children: React.ReactNode }) => (
              <div className="min-h-screen bg-white dark:bg-[#13111C]">
                  <Navbar variant="default" />
                  {children}
              </div>
          );

    // Apply highlights whenever data changes
    useEffect(() => {
        if (highlights.length >= 0 && note) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => applyHighlightsToDOM(highlights), 300);
            return () => clearTimeout(timer);
        }
    }, [highlights, note]);

    // Close highlight tooltip on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".user-highlight") && !target.closest(".highlight-tooltip")) {
                setActiveHighlightId(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <SkeletonContainer>
                <ArticleSkeleton />
            </SkeletonContainer>
        );
    }

    if (!note || !author) {
        const notFoundContent = (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-gray-500 font-['Manrope']">{t("note_detail.not_found")}</p>
            </div>
        );
        if (isAuthenticated)
            return (
                <MobileLayout showBottomNav={false}>
                    {notFoundContent}
                </MobileLayout>
            );
        return (
            <div className="min-h-screen bg-[#FAFAFA]">
                <Navbar variant="default" />
                {notFoundContent}
                <Footer />
            </div>
        );
    }

    const handleComment = async () => {
        if (!isAuthenticated) return openAuthModal("login");
        if (!commentText.trim() || isSubmittingComment) return;
        setIsSubmittingComment(true);
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const payload: any = { content: commentText };
            if (quoteContext) {
                payload.quote_context = quoteContext;
            }

            const res = await axios.post(
                `/api/v1/posts/${id}/comments`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const newComment = { ...res.data.data, user: user }; // inject user for UI
            setComments((prev: any[]) => [res.data.data, ...prev]);
            setCommentText("");
            setQuoteContext("");
            showToast(t("note_detail.comment_success"), "success");
        } catch (e: any) {
            console.error(t("note_detail.comment_failed"), e);
            showToast(
                e.response?.data?.message || t("note_detail.comment_failed"),
                "error",
            );
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (!isAuthenticated) return openAuthModal("login");
        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const res = await axios.post(`/api/v1/comments/${commentId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setComments(prev => prev.map(c => {
                const cid = c.id || c._id;
                if (cid === commentId) {
                    const isNowLiked = res.data.message.includes("liked") || !c.is_liked_by_me;
                    return {
                        ...c,
                        is_liked_by_me: isNowLiked,
                        likes_count: isNowLiked ? (c.likes_count || 0) + 1 : Math.max(0, (c.likes_count || 1) - 1)
                    };
                }
                return c;
            }));
            
            showToast(res.data.message || "Berhasil memperbarui suka", "success");
        } catch (error) {
            console.error("Gagal menyukai komentar", error);
            setComments(prev => prev.map(c => {
                const cid = c.id || c._id;
                if (cid === commentId) {
                    const isNowLiked = !c.is_liked_by_me;
                    return {
                        ...c,
                        is_liked_by_me: isNowLiked,
                        likes_count: isNowLiked ? (c.likes_count || 0) + 1 : Math.max(0, (c.likes_count || 1) - 1)
                    };
                }
                return c;
            }));
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!isAuthenticated) return openAuthModal("login");

        setConfirmConfig({
            isOpen: true,
            title: t("note_detail.delete_comment_title"),
            description: t("note_detail.delete_comment_desc"),
            variant: "danger",
            onConfirm: () => processDeleteComment(commentId)
        });
    };

    const processDeleteComment = async (commentId: string) => {
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            await axios.delete(`/api/v1/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setComments((prev: any[]) =>
                prev.filter((c: any) => c.id !== commentId && c._id !== commentId),
            );

            setNote((prev: any) => ({ ...prev, comments: prev.comments - 1 }));
            showToast(t("note_detail.delete_comment_success"), "success");
        } catch (e: any) {
            console.error(e);
            showToast(
                e.response?.data?.message || t("note_detail.delete_comment_failed"),
                "error",
            );
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!isAuthenticated) return openAuthModal("login");
        if (!editingCommentText.trim()) return;

        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            await axios.put(
                `/api/v1/comments/${commentId}`,
                { content: editingCommentText },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            setComments((prev: any[]) =>
                prev.map((c: any) =>
                    (c.id === commentId || c._id === commentId)
                        ? { ...c, content: editingCommentText }
                        : c,
                ),
            );

            setEditingCommentId(null);
            setEditingCommentText("");
            showToast(t("note_detail.update_comment_success"), "success");
        } catch (e: any) {
            console.error(e);
            showToast(
                e.response?.data?.message || t("note_detail.update_comment_failed"),
                "error",
            );
        }
    };

    const handleReplySubmit = async (parentId: string) => {
        if (!isAuthenticated) return openAuthModal("login");
        if (!replyText.trim() || isSubmittingReply) return;
        setIsSubmittingReply(true);
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const res = await axios.post(
                `/api/v1/posts/${id}/comments`,
                {
                    content: replyText,
                    parent_comment_id: parentId,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const newComment = { ...res.data.data, user: user };
            setComments((prev: any[]) => [newComment, ...prev]);
            setReplyingTo(null);
            setReplyText("");
            setNote((prev: any) => ({ ...prev, comments: prev.comments + 1 }));
        } catch (e: any) {
            showToast(
                e.response?.data?.message || "Gagal mengirim balasan",
                "error",
            );
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleCommentFromPanel = async () => {
        if (!isAuthenticated) return openAuthModal("login");
        if (!replyText.trim() || isSubmittingReply) return;
        setIsSubmittingReply(true);
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const payload: any = { content: replyText };
            if (quoteContext) {
                payload.quote_context = quoteContext;
            }
            const res = await axios.post(
                `/api/v1/posts/${id}/comments`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const newComment = { ...res.data.data, user: user };
            setComments((prev: any[]) => [newComment, ...prev]);
            setReplyText("");
            setQuoteContext("");
            setNote((prev: any) => ({ ...prev, comments: prev.comments + 1 }));
            showToast(t("note_detail.comment_success"), "success");
        } catch (e: any) {
            console.error(e);
            showToast(
                e.response?.data?.message || t("note_detail.comment_failed"),
                "error",
            );
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleLikePost = async () => {
        if (!isAuthenticated) return openAuthModal("login");
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");

            const res = await axios.post(
                `/api/v1/posts/${id}/like`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            // Langsung tempel data dari Backend lu ke UI
            setLiked(res.data.is_liked);
            setNote((prev: any) => ({ ...prev, likes: res.data.likes_count }));
        } catch (e) {
            console.error(e);
            showToast("Gagal memproses Like", "error");
        }
    };

    const handleReportSubmit = async () => {
        if (!isAuthenticated) return openAuthModal("login");
        if (!reportReason || !reportDescription)
            return showToast("Mohon isi semua field!", "warning");
        setIsSubmittingReport(true);
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const url =
                reportTarget?.type === "note"
                    ? `/api/v1/posts/${reportTarget.id}/report`
                    : `/api/v1/comments/${reportTarget?.id}/report`;

            await axios.post(
                url,
                { reason: reportReason, description: reportDescription },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            showToast(
                "Laporan berhasil dikirim, terima kasih telah menjaga lingkungan hijau Ba-Yu!",
                "success",
            );
            setShowReportModal(false);
            setReportReason("");
            setReportDescription("");
        } catch (e: any) {
            showToast(
                e.response?.data?.message || "Gagal mengirim laporan.",
                "error",
            );
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleVerifyPakar = async () => {
        setConfirmConfig({
            isOpen: true,
            title: t('note_detail.verify_title'),
            description: t('note_detail.verify_desc'),
            onConfirm: () => processVerifyPakar(),
            cancelText: t('admin_dashboard.btn_cancel'),
            confirmText: t('admin_dashboard.btn_continue')
        });
    };

    const handleUnverify = async () => {
        setConfirmConfig({
            isOpen: true,
            title: t('note_detail.unverify_title'),
            description: t('note_detail.unverify_desc'),
            variant: "danger",
            cancelText: t('admin_dashboard.btn_cancel'),
            confirmText: t('admin_dashboard.btn_continue'),
            onConfirm: () => processUnverify()
        });
    };

    const processUnverify = async () => {
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            await axios.put(
                `/api/v1/posts/${id}/unverify`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            setNote((prev: any) => ({ ...prev, isValidated: false, is_verified: false }));
            showToast("Verifikasi berhasil dicabut!", "success");
        } catch (e: any) {
            showToast(
                e.response?.data?.message || "Gagal mencabut verifikasi.",
                "error",
            );
        }
    };

    const processVerifyPakar = async () => {
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            await axios.put(
                `/api/v1/posts/${id}/verify`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            showToast("Catatan berhasil diverifikasi!", "success");
        } catch (e: any) {
            showToast(
                e.response?.data?.message || "Gagal memverifikasi catatan.",
                "error",
            );
        }
    };

    // Recommendations already fetched via useEffect above

    // Here, we simulate HTML content if the mock data just provides plain text.
    // We'll wrap it in standard paragraph tags to work with Quill's styling.
    const processedContent = note.content.includes("<")
        ? note.content
        : `<p>${note.content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p><br/><br/><p class="text-gray-500 italic text-center">...[Unduh file versi komplit di Bawah]...</p>`;

    const noteContent = (
        <div className={`pb-20 ${!isAuthenticated ? "pt-16 sm:pt-20" : ""}`}>
            {/* Notion/Medium-style Stylesheet explicitly for Reading Mode */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .notion-reader .ql-editor { padding: 0 !important; font-family: 'Manrope', sans-serif; font-size: 19px; line-height: 1.8; color: #292929; }
        .notion-reader .ql-editor h1 { font-family: 'Lexend Deca', sans-serif; font-size: 2em; font-weight: 800; margin: 1.5em 0 0.5em; color: #111827; letter-spacing: -0.02em; }
        .notion-reader .ql-editor h2 { font-family: 'Lexend Deca', sans-serif; font-size: 1.5em; font-weight: 700; margin: 1.5em 0 0.5em; color: #1f2937; letter-spacing: -0.01em; }
        .notion-reader .ql-editor h3 { font-family: 'Lexend Deca', sans-serif; font-size: 1.25em; font-weight: 600; margin: 1.2em 0 0.5em; color: #374151; }
        .notion-reader .ql-editor p { margin-bottom: 1.25em; }
        .notion-reader .ql-editor p:has(img) { display: flex; justify-content: center; text-align: center; width: 100%; }
        .notion-reader .ql-editor b, .notion-reader .ql-editor strong { font-weight: 700; color: #111827; }
        .notion-reader .ql-editor img { border-radius: 12px; margin: 2em auto; display: block; max-width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .notion-reader .ql-editor ul, .notion-reader .ql-editor ol { padding-left: 1.5em; margin-bottom: 1.25em; }
        .notion-reader .ql-editor li { margin-bottom: 0.5em; }
        .notion-reader .ql-editor blockquote { border-left: 4px solid #4f46e5; padding-left: 1em; margin: 1.5em 0; font-style: italic; color: #4b5563; background: #fafafa; padding: 1em 1em 1em 1.5em; border-radius: 0 8px 8px 0; }
        .notion-reader .ql-editor code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85em; color: #ef4444; }
        .notion-reader .ql-editor pre { background: #1f2937; color: #f3f4f6; padding: 1em; border-radius: 12px; overflow-x: auto; margin-bottom: 1.2em; }
        .notion-editor ul, .notion-editor ol { padding-left: 1.5em; margin: 1em 0; }
        .notion-editor li { margin-bottom: 0.3em; }
        .notion-editor ol.ql-alpha-list > li::before { content: counter(list-0, lower-alpha) ". " !important; }
        .notion-editor .ql-formula { padding: 3px 8px; background: #faf5ff; border-radius: 6px; border: 1px solid #e9d5ff; color: #7c3aed; display: inline-block; font-size: 0.9em; margin: 0 0.2em; }
        .notion-reader .ql-editor iframe { width: 100% !important; aspect-ratio: 16 / 9; height: auto !important; border-radius: 12px; margin: 2em 0; box-shadow: 0 4px 20px rgba(0,0,0,0.08);}
        .notion-reader .ql-editor .ql-video { display: block; max-width: 100%;}
        
        /* RTL Overrides for Reader */
        .notion-reader[dir="rtl"] .ql-editor { text-align: right; }
        .notion-reader[dir="rtl"] .ql-editor h1, .notion-reader[dir="rtl"] .ql-editor h2, .notion-reader[dir="rtl"] .ql-editor h3, .notion-reader[dir="rtl"] .ql-editor p { text-align: right; }
        .notion-reader[dir="rtl"] .ql-editor ul, .notion-reader[dir="rtl"] .ql-editor ol { padding-left: 0; padding-right: 1.5em; }
        .notion-reader[dir="rtl"] .ql-editor blockquote { border-left: none; border-right: 4px solid #4f46e5; border-radius: 8px 0 0 8px; }
        .notion-reader[dir="rtl"] .ql-editor pre, .notion-reader[dir="rtl"] .ql-editor code { direction: ltr !important; text-align: left !important; }
        `,
                }}
            />

            {/* Top Bar - Clean / Sticky */}
            <div className="sticky top-0 bg-white/95 dark:bg-[#13111C]/95 backdrop-blur-md border-b border-gray-100/50 dark:border-white/5 z-30 transition-all">
                <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center group"
                    >
                        <ArrowLeft
                            className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-100 transition-colors"
                            strokeWidth={2.5}
                        />
                    </button>

                    <div className="flex items-center gap-1">
                        {(user?.role === "pakar" || user?.role === "admin") && (
                            <>
                                {note.is_verified || note.isValidated ? (
                                    <button
                                        onClick={handleUnverify}
                                        className="hidden sm:flex mr-2 items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-lg text-[13px] font-['Lexend_Deca'] font-bold transition-colors"
                                    >
                                        <X className="w-4 h-4" />{t("note_detail.cancel_verification")}</button>
                                ) : (
                                    <button
                                        onClick={handleVerifyPakar}
                                        className="hidden sm:flex mr-2 items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-[13px] font-['Lexend_Deca'] font-bold transition-colors"
                                    >
                                        <ShieldCheck className="w-4 h-4" />{t("note_detail.verify")}</button>
                                )}
                            </>
                        )}
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-100"
                        >
                            <Share2
                                className="w-[18px] h-[18px]"
                                strokeWidth={2.5}
                            />
                        </button>
                        <button
                            onClick={() =>
                                requireAuth(() => toggleBookmark(note.id))
                            }
                            className={`p-2 rounded-full transition-colors ${isBookmarked(note.id) ? "text-primary bg-primary/5 hover:bg-primary/10" : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/10"}`}
                        >
                            <Bookmark
                                className={`w-[18px] h-[18px] ${isBookmarked(note.id) ? "fill-primary" : ""}`}
                                strokeWidth={2.5}
                            />
                        </button>
                        <button
                            onClick={() =>
                                requireAuth(() => {
                                    setReportTarget({
                                        type: "note",
                                        id: note.id,
                                        title: note.title,
                                    });
                                    setShowReportModal(true);
                                })
                            }
                            className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-600 hover:text-red-500"
                        >
                            <Flag
                                className="w-[18px] h-[18px]"
                                strokeWidth={2.5}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-5 lg:px-0 pt-8 mt-2">
                {/* Title */}
                <h1 className="font-['Lexend_Deca'] font-extrabold text-[2.5rem] md:text-[3.25rem] text-gray-900 dark:text-gray-100 mb-4 leading-[1.12] tracking-tight">
                    {note.title}
                </h1>

                {/* Category & Tags (Substack / Medium style over title) */}
                <div className="flex flex-wrap gap-2.5 mb-4 items-center">
                    <span className="text-[12px] font-['Lexend_Deca'] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        {t(`subjects.${note.mataPelajaran.toLowerCase().replace(/ /g, '-')}`, note.mataPelajaran)}
                    </span>
                    <span className="text-[14px] font-['Manrope'] font-bold text-gray-700 dark:text-gray-300 bg-gray-200/60 dark:bg-white/10 px-3 py-1 rounded-full border border-gray-300/30 dark:border-white/10">
                        {formatEducationLevel(note.jenjang, note.kelas || 1, note.semester || 1, language)}
                    </span>
                </div>
                {note.tags && note.tags.length > 0 && (
                    <TagList tags={note.tags} className="mb-8" />
                )}

                {/* Medium-style Author Info Bar */}
                <div className="flex items-center gap-4 py-4 mb-6">
                    <Link to={`/profile/${author._id || author.id}`}>
                        <AvatarImage
                            src={author.avatar}
                            alt={author.name}
                            size={48}
                            className="shadow-sm border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1C1A29] hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
                        />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/profile/${author._id || author.id}`}
                                className="font-['Manrope'] font-bold text-gray-900 dark:text-gray-100 text-[15px] hover:text-primary transition-colors"
                            >
                                {author.name || `@${author.username}`}
                            </Link>
                            {isAuthenticated &&
                                user?.id !== author.id &&
                                user?.id !== author._id &&
                                user?._id !== author.id &&
                                user?._id !== author._id && (
                                    <button
                                        onClick={() =>
                                            requireAuth(handleFollowToggle)
                                        }
                                        className={`text-sm font-['Manrope'] font-bold transition-colors ${
                                            isFollowing
                                                ? "text-gray-500 hover:text-gray-800"
                                                : isFollowPending
                                                ? "text-amber-600 hover:text-amber-700"
                                                : "text-emerald-600 hover:text-emerald-700"
                                        }`}
                                    >
                                        • {isFollowing ? t("note_detail.author_following") : isFollowPending ? t("note_detail.author_pending") : t("note_detail.author_follow")}
                                    </button>
                                )}
                            {!isAuthenticated && (
                                <button
                                    onClick={() => openAuthModal("login")}
                                    className="text-sm font-['Manrope'] text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                                >• {t("note_detail.author_follow")}</button>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-[13px] font-['Manrope'] text-gray-600 dark:text-gray-400 mt-0.5 font-bold">
                            <div className="flex items-center gap-1.5">
                                <span>{new Date(note.createdAt).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { year: "numeric", month: "long", day: "numeric" })}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                            <div className="flex items-center gap-1.5">
                                <Clock
                                    className="w-3.5 h-3.5"
                                    strokeWidth={2.5}
                                />
                                <span>{note.read_time || 1} {t('note_detail.read_time') !== 'note_detail.read_time' ? t('note_detail.read_time') : 'mnt baca'}</span>
                            </div>
                            {author.role === "pakar" && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-400 hidden sm:block"></span>
                                    <span className="text-green-700 font-bold flex items-center gap-1 hidden sm:flex">
                                        <Check
                                            className="w-3.5 h-3.5"
                                            strokeWidth={2.5}
                                        />{" "}
                                        {t("note_detail.verified_expert")}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Interactivity Bar Top */}
                <div className="flex items-center justify-between py-3 border-y border-gray-100/80 dark:border-white/5 mb-10 px-1">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleLikePost}
                            className="flex items-center gap-2 text-[15px] font-['Manrope'] font-bold transition-colors group"
                            aria-label="Suka catatan"
                        >
                            <Heart
                                className={`w-5 h-5 transition-transform group-hover:scale-110 ${liked ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-400 group-hover:text-red-500"}`}
                                strokeWidth={2.5}
                            />
                            <span
                                className={
                                    liked ? "text-red-500" : "text-gray-600"
                                }
                            >
                                {note.likes}
                            </span>
                        </button>

                        <button
                            onClick={() => setIsCommentDrawerOpen(true)}
                            className="flex items-center gap-2 text-[15px] font-['Manrope'] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-100 transition-colors group"
                        >
                            <MessageCircle
                                className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-100 transition-transform group-hover:scale-110"
                                strokeWidth={2.5}
                            />
                            <span>{comments.length}</span>
                        </button>

                        <button
                            onClick={handleDownloadPDF}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-100 ml-1 group"
                            title="Download Catatan"
                        >
                            <Download
                                className="w-[18px] h-[18px] transition-transform"
                                strokeWidth={2.5}
                            />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {note.isValidated && (
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20 shadow-sm dark:shadow-none animate-in fade-in duration-700">
                                <ShieldCheck className="w-3.5 h-3.5" />{t("note_detail.expert_review")}</div>
                        )}
                    </div>
                </div>

                <div className="mb-16 relative">
                    <div
                        id="area-materi-pdf"
                        dir={isContentRtl ? 'rtl' : 'ltr'}
                        className={`notion-reader ql-snow note-content-container relative ${note.is_restricted ? "max-h-[750px] overflow-hidden select-none" : ""}`}
                    >
                        <div
                            className="ql-editor"
                            dangerouslySetInnerHTML={{ __html: processedContent }}
                        />

                        {note.is_restricted && (
                            <div className="absolute inset-x-0 top-[250px] bottom-0 z-10 pointer-events-none flex flex-col">
                                {/* Smooth transition into the blur */}
                                <div className="h-24 bg-gradient-to-b from-transparent to-white/60 dark:to-[#13111C]/60 backdrop-blur-[2px]"></div>
                                {/* Full blur for the rest of the content */}
                                <div className="flex-1 bg-white/60 dark:bg-[#13111C]/60 backdrop-blur-[8px]"></div>
                                {/* Bottom fade out */}
                                <div className="h-48 bg-gradient-to-t from-white dark:from-[#13111C] via-white/90 dark:via-[#13111C]/90 to-transparent backdrop-blur-[8px]"></div>
                            </div>
                        )}
                    </div>

                    {note.is_restricted && (
                        <div className="px-4 -mt-64 relative z-20">
                            <div className="bg-white/90 dark:bg-[#1C1A29]/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center max-w-2xl mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none animate-in fade-in zoom-in-95 duration-700">
                                <div className="w-16 h-16 bg-white dark:bg-[#1C1A29] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-white/5">
                                    <LockIcon className="w-7 h-7 text-slate-700 dark:text-slate-300" />
                                </div>
                                
                                <h4 className="font-['Lexend_Deca'] font-bold text-2xl text-slate-900 dark:text-slate-100 mb-3 tracking-tight">{t("note_detail.restricted_access")}</h4>
                                
                                <p className="font-['Manrope'] text-[15px] text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed max-w-md mx-auto">{t("note_detail.restricted_desc")} <b>@{author?.username}</b></p>
                                
                                <button 
                                    onClick={() => requireAuth(handleFollowToggle)}
                                    disabled={isFollowPending}
                                    className={`px-8 py-3.5 rounded-xl font-bold font-['Manrope'] text-[14px] transition-all flex items-center justify-center gap-2 mx-auto ${
                                        isFollowPending 
                                        ? "bg-slate-200 dark:bg-white/10 text-slate-500 cursor-not-allowed" 
                                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-md hover:shadow-lg"
                                    }`}
                                >
                                    {isFollowPending ? (
                                        <>{t("note_detail.request_sent")}</>
                                    ) : (
                                        <>{t("note_detail.request_access")}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* CLEAN DOWNLOAD CARD */}
                <div className="mt-16 mb-16 relative w-full rounded-[32px] overflow-hidden border border-gray-200/50 dark:border-white/5 bg-white dark:bg-[#1C1A29] shadow-sm">
                    {/* Background Accents for Dark/Light Mode */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-50/50 dark:bg-primary/5 rounded-full blur-[60px] pointer-events-none translate-y-1/3 -translate-x-1/3" />
                    
                    <div className="relative z-10 p-10 sm:p-14 text-center flex flex-col items-center">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center mb-6">
                            <Download className="w-6 h-6 text-indigo-500 dark:text-indigo-400" strokeWidth={2} />
                        </div>
                        
                        <h3 className="font-['Lexend_Deca'] font-bold text-2xl text-gray-900 dark:text-white mb-3 tracking-tight">
                            {t("note_detail.full_material")}
                        </h3>
                        
                        <p className="font-['Manrope'] text-[15px] text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                            {t("note_detail.download_desc")}
                        </p>
                        
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center justify-center gap-2.5 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 dark:bg-[#706BFF] dark:hover:bg-[#5C57FF] text-white rounded-2xl text-[13px] font-['Lexend_Deca'] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-indigo-500/20 dark:shadow-none"
                        >
                            <FileText className="w-4 h-4 opacity-80" />
                            {t("note_detail.download_pdf")}
                        </button>
                    </div>
                </div>

                {/* PREMIUM VERIFIED CARD */}
                {note.isValidated && validator && (
                    <div className="bg-white dark:bg-[#1C1A29] rounded-[40px] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10 mb-24 shadow-[0_20px_50px_-12px_rgba(93,92,230,0.12)] dark:shadow-none border border-emerald-50 dark:border-white/5 relative overflow-hidden group mt-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-50/30 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-8 flex-1 relative z-10">
                            <div className="w-24 h-24 bg-emerald-500 rounded-[36px] flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-transform duration-700">
                                <ShieldCheck className="w-12 h-12 text-white" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em] bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm dark:shadow-none">{t("note_detail.expert_verified")}</span>
                                </div>
                                <h4 className="font-['Lexend_Deca'] font-black text-3xl text-slate-900 dark:text-slate-100 tracking-tight">{t("note_detail.expert_curation")}</h4>
                                {note.verify_reason ? (
                                    <div className="relative">
                                        <MessageSquare className="absolute -left-2 -top-2 w-10 h-10 text-emerald-100 dark:text-emerald-900/30 opacity-50" />
                                        <p className="font-['Manrope'] text-slate-600 dark:text-slate-400 text-[16px] leading-relaxed max-w-xl font-bold italic relative z-10 pl-2">
                                            "{note.verify_reason.length > 150 ? note.verify_reason.substring(0, 150) + "..." : note.verify_reason}"
                                        </p>
                                        {note.verify_reason.length > 150 && (
                                            <button 
                                                onClick={() => setIsReviewModalOpen(true)}
                                                className="mt-3 ml-2 text-[13px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors uppercase tracking-widest font-['Lexend_Deca']"
                                            >{t("note_detail.read_more")}</button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="font-['Manrope'] text-slate-400 dark:text-slate-500 text-[15px] leading-relaxed max-w-lg font-medium italic">{t("note_detail.high_rating")}</p>
                                )}
                            </div>
                        </div>

                        <Link
                            to={validator.id ? `/profile/${validator.id}` : "#"}
                            className="bg-slate-50/80 dark:bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none flex items-center gap-6 shrink-0 w-full lg:w-auto relative z-10 group/pakar hover:border-indigo-100 dark:hover:border-primary/30 transition-all duration-500 cursor-pointer"
                        >
                            <div className="relative">
                                <AvatarImage
                                    src={validator.avatar}
                                    alt={validator.name || validator.username}
                                    size={64}
                                    className="rounded-2xl border-4 border-white dark:border-[#1C1A29] shadow-lg dark:shadow-none"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1C1A29] flex items-center justify-center shadow-sm">
                                    <Check
                                        className="w-3.5 h-3.5 text-white"
                                        strokeWidth={4}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-1.5">{t("note_detail.verified_by")}</p>
                                <p className="text-[18px] font-['Lexend_Deca'] font-black text-slate-900 dark:text-slate-100 group-hover/pakar:text-indigo-600 dark:group-hover/pakar:text-primary transition-colors leading-none mb-2">
                                    {validator.name || validator.username}
                                </p>
                                <div className="flex items-center gap-2 mt-3 bg-white px-3 py-1.5 rounded-xl border border-slate-100 w-fit shadow-sm">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={13}
                                                fill={
                                                    i <
                                                    (note.expert_rating || 5)
                                                        ? "#f59e0b"
                                                        : "transparent"
                                                }
                                                className={
                                                    i <
                                                    (note.expert_rating || 5)
                                                        ? "text-amber-500"
                                                        : "text-slate-200"
                                                }
                                            />
                                        ))}
                                    </div>
                                    <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10 mx-1" />
                                    <span className="text-[11px] font-black text-slate-900 dark:text-slate-100">
                                        {(note.expert_rating || 5).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                    
                )}

                {/* Expert Review Modal */}
                {isReviewModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-[#1C1A29] rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative border border-slate-100 dark:border-white/5 animate-in zoom-in-95 duration-300">
                            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-10">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="p-8 md:p-10 border-b border-emerald-50 dark:border-white/5 bg-emerald-50/50 dark:bg-emerald-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
                                <div className="w-16 h-16 bg-emerald-500 rounded-[20px] flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 relative z-10">
                                    <ShieldCheck className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-['Lexend_Deca'] font-extrabold text-2xl text-slate-900 dark:text-slate-100 mb-2 relative z-10">{t("note_detail.full_expert_review")}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium font-['Manrope'] relative z-10">{t("note_detail.curation_notes_from")} {validator?.name}</p>
                            </div>
                            <div className="p-8 md:p-10 overflow-y-auto">
                                <p className="font-['Manrope'] text-slate-700 dark:text-slate-300 text-[16px] leading-relaxed font-medium whitespace-pre-wrap italic">
                                    "{note.verify_reason}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Separator */}
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-16"></div>

                {/* Author Bottom Profile (Substack style) */}
                <div className="mb-20">
                    <h4 className="font-['Lexend_Deca'] font-extrabold text-[13px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6 text-center sm:text-left">{t("note_detail.written_by")}</h4>
                    <div className="bg-transparent flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        <Link to={`/profile/${author._id || author.id}`}>
                            <AvatarImage
                                src={author.avatar}
                                alt={author.name || author.username}
                                size={96}
                                className="sm:!w-28 sm:!h-28 !w-24 !h-24 shrink-0 border border-gray-100 dark:border-white/10 hover:ring-4 hover:ring-primary/20 transition-all cursor-pointer"
                            />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                <Link
                                    to={`/profile/${author._id || author.id}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    <h3 className="font-['Lexend_Deca'] font-extrabold text-[28px] text-gray-900 dark:text-gray-100 hover:text-primary transition-colors leading-none">
                                        {author.name || `@${author.username}`}
                                    </h3>
                                </Link>
                                {author.role === "pakar" && (
                                    <div
                                        className="bg-green-500 text-white p-0.5 rounded-full"
                                        title={t("note_detail.verified_expert")}
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </div>
                            <p className="font-['Manrope'] text-[16px] text-gray-800 dark:text-gray-300 mb-6 max-w-xl leading-relaxed font-medium">
                                {author.bio ? author.bio : (
                                    author.role === "pakar"
                                        ? t("note_detail.default_pakar_bio")
                                        : t("note_detail.default_user_bio")
                                )}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button
                                    onClick={() =>
                                        requireAuth(handleFollowToggle)
                                    }
                                    className={`w-full sm:w-auto px-8 py-3 rounded-full text-[15px] font-['Manrope'] font-bold transition-all ${
                                        isFollowing
                                            ? "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/15"
                                            : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-200 shadow-sm"
                                    }`}
                                >
                                    {isFollowing ? t("note_detail.author_following") : t("note_detail.follow_author")}
                                </button>

                                <div className="flex items-center gap-6 mt-4 sm:mt-0 font-['Manrope'] text-[15px] text-gray-600 dark:text-gray-400 font-bold">
                                    <Link 
                                        to={`/profile/${author._id || author.id}?open=followers`}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                                    >
                                        <span className="font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                            {followerCount}
                                        </span>{" "}
                                        {t("note_detail.followers")}
                                    </Link>
                                    <Link 
                                        to={`/profile/${author._id || author.id}?tab=catatan`}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                                    >
                                        <span className="font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                            {author.totalCatatan || 0}
                                        </span>{" "}
                                        {t("note_detail.posts")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline Comments Preview */}
                <div className="mt-12 border-t border-gray-100 dark:border-white/5 pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-primary" strokeWidth={2.5} />{t("note_detail.discussion")} ({comments.length})
                        </h4>
                        <button
                            onClick={() => setIsCommentDrawerOpen(true)}
                            className="font-['Manrope'] font-bold text-[14px] text-primary hover:text-indigo-600 transition-colors"
                        >{t("note_detail.write_comment")}</button>
                    </div>

                    <div className="space-y-6">
                        {/* Native Comment Input Preview */}
                        {isAuthenticated ? (
                            <div className="flex gap-4 mb-8">
                                <AvatarImage src={user?.avatar} alt={user?.name || user?.username || "User"} size={40} className="rounded-full flex-shrink-0 object-cover" />
                                <div className="flex-1">
                                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                        {quoteContext && (
                                            <div className="mb-3 pl-3 border-l-4 border-indigo-300 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 p-2 rounded-r-lg flex justify-between items-start gap-2">
                                                <p className="text-[12px] font-['Manrope'] text-gray-600 dark:text-gray-400 italic line-clamp-2 font-medium">
                                                    "{quoteContext}"
                                                </p>
                                                <button
                                                    onClick={() => setQuoteContext("")}
                                                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder={t("note_detail.write_discussion")}
                                            className="w-full bg-transparent border-none text-[14px] font-['Manrope'] text-left focus:outline-none focus:ring-0 resize-none min-h-[60px] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 font-medium"
                                        />
                                        <div className="flex justify-end items-center mt-2 border-t border-gray-100 dark:border-white/5 pt-2">
                                            <button
                                                onClick={handleComment}
                                                disabled={!commentText.trim() || isSubmittingComment}
                                                className="px-5 py-2 bg-primary hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-[13px] font-['Lexend_Deca'] font-bold transition-all shadow-sm flex items-center gap-1.5"
                                            >
                                                {isSubmittingComment ? t('note_detail.comment_sending') : t('note_detail.comment_send')} <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center mb-8">
                                <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 mb-4 font-medium">{t("note_detail.login_to_discuss")}</p>
                                <button onClick={() => { setIsCommentDrawerOpen(false); openAuthModal("login"); }} className="px-6 py-2.5 bg-white dark:bg-[#252336] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-xl text-[13px] font-['Lexend_Deca'] font-bold shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-colors inline-flex items-center gap-2">
                                    <LogIn className="w-4 h-4" /> Masuk Sekarang
                                </button>
                            </div>
                        )}

                        {comments.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="font-['Manrope'] text-[14px] text-gray-500 font-medium italic">
                                    Belum ada diskusi untuk catatan ini.
                                </p>
                            </div>
                        ) : (
                            <>
                                {comments
                                    .filter((c) => !c.parent_comment_id)
                                    .slice(0, 2)
                                    .map((comment) => {
                                        const cAuth = comment.user || getUserById(comment.userId);
                                        if (!cAuth) return null;
                                        const rootId = comment.id || comment._id;
                                        const childReplies = comments.filter((c) => c.parent_comment_id === rootId);
                                        const isLiked = comment.is_liked_by_me;
                                        
                                        return (
                                            <div key={rootId} className="flex gap-4">
                                                <AvatarImage src={cAuth.avatar} alt={cAuth.name} size={40} className="rounded-full flex-shrink-0 object-cover" />
                                                <div className="flex-1">
                                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-['Lexend_Deca'] font-bold text-[14px] text-gray-900 dark:text-gray-100">{cAuth.name || cAuth.username || "Anonim"}</h5>
                                                            <span className="font-['Manrope'] text-[11px] font-bold text-gray-500 dark:text-gray-500">{comment.created_at ? new Date(comment.created_at).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language)) : t("note_detail.date_just_now")}</span>
                                                        </div>
                                                        {comment.quote_context && (
                                                            <div className="mb-2 pl-3 border-l-[3px] border-indigo-200 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 py-1.5 pr-2 rounded-r-lg">
                                                                <p className="font-['Manrope'] text-[13px] text-gray-600 dark:text-gray-400 italic line-clamp-1 font-medium">
                                                                    "{comment.quote_context}"
                                                                </p>
                                                            </div>
                                                        )}
                                                        {editingCommentId === rootId ? (
                                                            <div className="mt-2 mb-4">
                                                                <textarea
                                                                    value={editingCommentText}
                                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-primary/30 dark:border-primary/50 rounded-xl font-['Manrope'] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px]"
                                                                    autoFocus
                                                                />
                                                                <div className="flex gap-2 mt-2">
                                                                    <button
                                                                        onClick={() => handleUpdateComment(rootId)}
                                                                        className="px-4 py-1.5 bg-primary text-white text-[11px] font-['Lexend_Deca'] font-bold rounded-lg hover:bg-indigo-600 transition-colors"
                                                                    >{t("note_detail.save")}</button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingCommentId(null);
                                                                            setEditingCommentText("");
                                                                        }}
                                                                        className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-[11px] font-['Lexend_Deca'] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                                                    >{t("note_detail.cancel")}</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="font-['Manrope'] text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium mb-3">
                                                                {comment.content}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-[11px] font-['Lexend_Deca'] font-black text-gray-500 dark:text-gray-400">
                                                            <button 
                                                                onClick={() => handleLikeComment(rootId)}
                                                                className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                                                            >
                                                                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} strokeWidth={3} />
                                                                {comment.likes_count > 0 ? comment.likes_count : t('note_detail.comment_like')}
                                                            </button>
                                                             <button 
                                                                 onClick={() => {
                                                                     setIsCommentDrawerOpen(true);
                                                                     setReplyingTo({ id: rootId, name: cAuth.name || cAuth.username || "Anonim" });
                                                                 }}
                                                                 className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                                             >
                                                                 <MessageSquare className="w-3.5 h-3.5" strokeWidth={3} />{t("note_detail.reply")}</button>
                                                             
                                                             <div className="relative">
                                                                <button 
                                                                    onClick={() => setActiveCommentMenu(activeCommentMenu === `inline-${rootId}` ? null : `inline-${rootId}`)}
                                                                    className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all focus:outline-none"
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4" strokeWidth={3} />
                                                                </button>
                                                                {activeCommentMenu === `inline-${rootId}` && (
                                                                    <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-[#1C1A29] rounded-xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-white/5 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                                        {user && ((user._id && cAuth._id && String(user._id) === String(cAuth._id)) || (user.id && cAuth.id && String(user.id) === String(cAuth.id))) ? (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setActiveCommentMenu(null);
                                                                                        setEditingCommentId(rootId);
                                                                                        setEditingCommentText(comment.content);
                                                                                    }}
                                                                                    className="w-full text-left px-4 py-2.5 text-xs font-['Manrope'] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                                                                >
                                                                                    <Pencil className="w-3.5 h-3.5" />{t("note_detail.edit_comment")}</button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setActiveCommentMenu(null);
                                                                                        handleDeleteComment(rootId);
                                                                                    }}
                                                                                    className="w-full text-left px-4 py-2.5 text-xs font-['Manrope'] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />{t("note_detail.delete")}</button>
                                                                            </>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setActiveCommentMenu(null);
                                                                                    setReportTarget({ type: "comment", id: rootId });
                                                                                    setShowReportModal(true);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2.5 text-xs font-['Manrope'] font-bold text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-2.5"
                                                                            >
                                                                                <Flag className="w-3.5 h-3.5" />{t("note_detail.report")}</button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                             </div>
                                                        </div>
                                                    </div>

                                                    {/* Inline Replies Preview */}
                                                    {childReplies.length > 0 && (
                                                        <div className="mt-3 space-y-3">
                                                            {childReplies.slice(0, 2).map((reply) => {
                                                                const rAuth = reply.user || getUserById(reply.userId);
                                                                if (!rAuth) return null;
                                                                return (
                                                                    <div key={reply.id || reply._id} className="flex gap-3">
                                                                        <AvatarImage src={rAuth.avatar} alt={rAuth.name} size={28} className="rounded-full flex-shrink-0 object-cover" />
                                                                        <div className="flex-1 bg-gray-50/50 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5">
                                                                            <div className="flex justify-between items-start mb-1">
                                                                                <h5 className="font-['Lexend_Deca'] font-bold text-[12px] text-gray-900 dark:text-gray-100">{rAuth.name || rAuth.username || "Anonim"}</h5>
                                                                                <span className="font-['Manrope'] text-[10px] font-bold text-gray-500 dark:text-gray-500">{reply.created_at ? new Date(reply.created_at).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language)) : t("note_detail.date_just_now")}</span>
                                                                            </div>
                                                                            <p className="font-['Manrope'] text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                                                {reply.content}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {childReplies.length > 2 && (
                                                                <button
                                                                    onClick={() => setIsCommentDrawerOpen(true)}
                                                                    className="ml-[40px] text-[12px] font-['Manrope'] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                                                                >
                                                                    {t("note_detail.view_more_replies").replace("{{count}}", (childReplies.length - 2).toString())}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                {comments.length > 2 && (
                                    <button
                                        onClick={() => setIsCommentDrawerOpen(true)}
                                        className="w-full py-4 mt-2 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 rounded-xl font-['Lexend_Deca'] font-bold text-[14px] transition-colors border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center gap-2"
                                    >
                                        {t("note_detail.load_more_comments").replace("{{count}}", (comments.length - 2).toString())}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* More From Author Section */}
                {moreFromAuthor.length > 0 && (
                    <div className="mt-8 border-t border-gray-100 dark:border-white/5 pt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100">
                                Lainnya dari <span className="text-primary">{author.name || author.username}</span>
                            </h4>
                            {moreFromAuthor.length >= 4 && (
                                <Link to={`/profile/${author.id || author._id}`} className="text-sm font-bold text-primary hover:text-indigo-700 transition-colors">{t("note_detail.view_all")}</Link>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {moreFromAuthor.map((recNote: any) => {
                                const mappedNote = {
                                    ...recNote,
                                    id: recNote.id || recNote._id,
                                    title: recNote.title,
                                    description: recNote.content ? recNote.content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..." : "Tidak ada deskripsi",
                                    thumbnail: recNote.thumbnail || null,
                                    author: recNote.user ? { ...recNote.user, avatar: recNote.user.avatar || null } : { name: "Anonim", avatar: null },
                                    mataPelajaran: recNote.mapel || t("note_detail.report_reason_other"),
                                    jenjang: recNote.jenjang || "-",
                                    kelas: recNote.kelas || "-",
                                    semester: recNote.semester || "-",
                                    createdAt: recNote.created_at,
                                    likes: recNote.likes_count || 0,
                                    comments: recNote.comments_count || 0,
                                    views: recNote.views || 0,
                                    rating: recNote.rating || 5,
                                };
                                return <NoteCard key={mappedNote.id} note={mappedNote} />;
                            })}
                        </div>
                    </div>
                )}

                {/* Recommended Notes Section */}
                <div className={`mt-8 mb-24 ${moreFromAuthor.length > 0 ? 'border-t border-gray-100 dark:border-white/5 pt-16' : 'border-t border-gray-100 dark:border-white/5 pt-16'}`}>
                    <h4 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-8">
                        {t("note_detail.recommendation_title")} <span className="text-primary">{t("note_detail.recommendation_subtitle")}</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        {recommendedNotes.map((recNote: any) => {
                            const mappedNote = {
                                ...recNote,
                                id: recNote.id || recNote._id,
                                title: recNote.title,
                                description: recNote.content ? recNote.content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..." : "Tidak ada deskripsi",
                                thumbnail: recNote.thumbnail || null,
                                author: recNote.user ? { ...recNote.user, avatar: recNote.user.avatar || null } : { name: "Anonim", avatar: null },
                                mataPelajaran: recNote.mapel || t("note_detail.report_reason_other"),
                                jenjang: recNote.jenjang || "-",
                                kelas: recNote.kelas || "-",
                                semester: recNote.semester || "-",
                                createdAt: recNote.created_at,
                                likes: recNote.likes_count || 0,
                                comments: recNote.comments_count || 0,
                                views: recNote.views || 0,
                                rating: recNote.rating || 5,
                            };
                            return <NoteCard key={mappedNote.id} note={mappedNote} />;
                        })}
                    </div>
                </div>
            </article>

        </div>
    );


    const modals = (
        <>
            {/* Side Drawer Komentar (Side Panel) */}
            <div
                className={`fixed top-[130px] h-[calc(100vh-140px)] right-4 z-[60] w-[calc(100%-32px)] sm:w-[480px] bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[32px] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
                    isCommentDrawerOpen ? "translate-x-0" : "translate-x-[110%]"
                } flex flex-col`}
            >
                <div className="flex flex-col border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h4 className="font-['Lexend_Deca'] font-bold text-xl text-gray-900 dark:text-gray-100">{t("note_detail.discussion")} ({comments.length})
                        </h4>
                        <button
                            onClick={() => setIsCommentDrawerOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    {/* Sort Filter UI */}
                    <div className="flex items-center gap-3 px-6 pb-4 overflow-x-auto custom-scrollbar">
                        <button onClick={() => setCommentSort("newest")} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-['Manrope'] font-bold transition-all ${commentSort === "newest" ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"}`}>{t("note_detail.sort_newest") || "Terbaru"}</button>
                        <button onClick={() => setCommentSort("top")} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-['Manrope'] font-bold transition-all ${commentSort === "top" ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"}`}>{t("note_detail.sort_top") || "Terpopuler"}</button>
                        <button onClick={() => setCommentSort("oldest")} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-['Manrope'] font-bold transition-all ${commentSort === "oldest" ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"}`}>{t("note_detail.sort_oldest") || "Terlama"}</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {/* Comments List */}
                    <div className="space-y-6 sm:space-y-8">
                        {comments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="font-['Manrope'] text-base text-gray-600 dark:text-gray-400 font-bold">{t("note_detail.no_comments_yet")}</p>
                            </div>
                        ) : (
                            [...comments]
                                .filter((c) => !c.parent_comment_id)
                                .sort((a, b) => {
                                    if (commentSort === "top") {
                                        const likesA = a.likes_count || 0;
                                        const likesB = b.likes_count || 0;
                                        if (likesB !== likesA) return likesB - likesA;
                                        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                                    } else if (commentSort === "oldest") {
                                        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                                    } else {
                                        // newest
                                        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                                    }
                                })
                                .map((root) => {
                                    const rootId = root._id || root.id;
                                    const childReplies = comments.filter(
                                        (c) => c.parent_comment_id === rootId,
                                    );

                                    const renderCommentItem = (
                                        comment: any,
                                        isReply: boolean = false,
                                    ) => {
                                        const cAuth =
                                            comment.user ||
                                            getUserById(comment.userId);
                                        if (!cAuth) return null;
                                        const cid = comment._id || comment.id;
                                        const currentLikes =
                                            comment.likes_count || 0;
                                        const isLiked =
                                            comment.is_liked ||
                                            comment.is_liked_by_me ||
                                            false;

                                        return (
                                            <div
                                                key={`comment-el-${cid}`}
                                                id={`comment-${cid}`}
                                                className={`flex gap-3 sm:gap-4 p-2 rounded-2xl ${isReply ? "bg-gray-50/50 dark:bg-white/5" : ""}`}
                                            >
                                                <Link
                                                    to={`/profile/${cAuth._id || cAuth.id}`}
                                                >
                                                    <AvatarImage
                                                        src={cAuth.avatar}
                                                        alt={cAuth.name}
                                                        size={48}
                                                        className="shrink-0 border border-gray-100 dark:border-white/10 hover:ring-2 hover:ring-primary/20 transition-all sm:w-12 sm:h-12 w-10 h-10"
                                                    />
                                                </Link>
                                                <div className="flex-1 w-full min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex flex-wrap items-center gap-1.5 cursor-pointer">
                                                            <Link
                                                                to={`/profile/${cAuth._id || cAuth.id}`}
                                                                className="font-['Manrope'] font-bold text-base text-gray-900 dark:text-gray-100 hover:underline hover:text-primary transition-colors"
                                                            >
                                                                {cAuth.name || cAuth.username || "Anonim"}
                                                            </Link>
                                                            {cAuth.role ===
                                                                "pakar" && (
                                                                <Check
                                                                    className="w-3.5 h-3.5 bg-green-600 text-white rounded-full p-[2px]"
                                                                    strokeWidth={
                                                                        3
                                                                    }
                                                                />
                                                            )}
                                                            <span className="text-[11px] font-['Manrope'] text-gray-500 font-bold mt-0.5 whitespace-nowrap">
                                                                • {new Date(
                                                                    comment.created_at ||
                                                                        Date.now(),
                                                                ).toLocaleDateString(
                                                                    (language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language),
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="relative">
                                                            <button
                                                                onClick={() =>
                                                                    setActiveCommentMenu(
                                                                        activeCommentMenu ===
                                                                            `panel-${cid}`
                                                                            ? null
                                                                            : `panel-${cid}`,
                                                                    )
                                                                }
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                            {activeCommentMenu ===
                                                                `panel-${cid}` && (
                                                                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1C1A29] rounded-xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-white/5 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                                                                    {user && ((user._id && cAuth._id && String(user._id) === String(cAuth._id)) || (user.id && cAuth.id && String(user.id) === String(cAuth.id))) ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setActiveCommentMenu(null);
                                                                                    setEditingCommentId(cid);
                                                                                    setEditingCommentText(comment.content);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2.5 text-xs font-['Manrope'] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                                                            >
                                                                                <Pencil className="w-3.5 h-3.5" />{t("note_detail.edit_comment")}</button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setActiveCommentMenu(null);
                                                                                    handleDeleteComment(cid);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2.5 text-xs font-['Manrope'] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />{t("note_detail.delete")}</button>
                                                                        </>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                setActiveCommentMenu(null);
                                                                                setReportTarget({ type: "comment", id: cid });
                                                                                setShowReportModal(true);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2.5 text-xs font-['Manrope'] font-bold text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-2.5"
                                                                        >
                                                                            <Flag className="w-3.5 h-3.5" />{t("note_detail.report")}</button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Render Quote Context jika ada */}
                                                    {comment.quote_context && (
                                                        <div className="mb-2 pl-3 border-l-[3px] border-indigo-200 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 py-1.5 pr-2 rounded-r-lg relative group">
                                                            <p className={`font-['Manrope'] text-[13px] text-gray-600 dark:text-gray-400 italic font-medium transition-all duration-300 pr-6 ${expandedQuotes[cid] ? '' : 'line-clamp-2'}`}>
                                                                "{comment.quote_context}"
                                                            </p>
                                                            {comment.quote_context.length > 90 && (
                                                                <button 
                                                                    onClick={() => setExpandedQuotes(prev => ({ ...prev, [cid]: !prev[cid] }))}
                                                                    className={`absolute bottom-1 right-2 p-1 bg-white dark:bg-[#1C1A29] rounded-full shadow-sm hover:text-indigo-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center border border-gray-100 dark:border-white/5 ${expandedQuotes[cid] ? 'text-indigo-500' : 'text-gray-400'}`}
                                                                >
                                                                    <MoreHorizontal className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {editingCommentId === cid ? (
                                                        <div className="mt-2 mb-4">
                                                            <textarea
                                                                value={editingCommentText}
                                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-primary/30 dark:border-primary/50 rounded-xl font-['Manrope'] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px]"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => handleUpdateComment(cid)}
                                                                    className="px-4 py-1.5 bg-primary text-white text-[11px] font-['Lexend_Deca'] font-bold rounded-lg hover:bg-indigo-600 transition-colors"
                                                                >{t("note_detail.save")}</button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCommentId(null);
                                                                        setEditingCommentText("");
                                                                    }}
                                                                    className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-[11px] font-['Lexend_Deca'] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                                                >{t("note_detail.cancel")}</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="font-['Manrope'] text-[15px] text-gray-800 dark:text-gray-300 mb-3 leading-relaxed font-medium">
                                                            {comment.content}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs font-['Manrope'] font-extrabold text-gray-500 dark:text-gray-400">
                                                        <button
                                                            onClick={() => handleLikeComment(cid)}
                                                            className={`flex items-center gap-1.5 transition-colors ${isLiked ? "text-red-500" : "hover:text-red-500"}`}
                                                        >
                                                            <Heart
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                                className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500" : ""}`}
                                                            />{" "}
                                                            {t("note_detail.comment_like")}{" "}
                                                            {currentLikes > 0 &&
                                                                `(${currentLikes})`}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (!isAuthenticated) return openAuthModal("login");
                                                                setReplyingTo({
                                                                    id: cid,
                                                                    name: cAuth.name,
                                                                });
                                                                setReplyText("");
                                                            }}
                                                            className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                                        >
                                                            <MessageCircle
                                                                className="w-3.5 h-3.5"
                                                                strokeWidth={2.5}
                                                            />{" "}
                                                            {t("note_detail.comment_reply")}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    };

                                    return (
                                        <div
                                            key={`root-comment-${rootId}`}
                                            className="flex flex-col gap-4"
                                        >
                                            {renderCommentItem(root, false)}
                                            {childReplies.length > 0 && (
                                                <div className="ml-10 sm:ml-12 flex flex-col gap-3 sm:gap-4 border-l-[3px] border-gray-100 dark:border-white/10 pl-4 sm:pl-5 bg-gray-50/20 dark:bg-white/[0.02] rounded-r-2xl py-2">
                                                    {childReplies.map((child) =>
                                                        renderCommentItem(
                                                            child,
                                                            true,
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
                    {replyingTo && (
                        <div className="flex items-center justify-between mb-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                            <p className="text-xs font-['Manrope'] font-bold text-indigo-600 dark:text-indigo-400">
                                {t("note_detail.comment_replying")} {" "}
                                <span className="font-extrabold">
                                    @{replyingTo.name}
                                </span>
                            </p>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            </button>
                        </div>
                    )}
                    {quoteContext && (
                        <div className="mb-3 pl-3 border-l-4 border-indigo-300 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-r-xl flex justify-between items-start gap-2">
                            <p className="text-[13px] font-['Manrope'] text-gray-700 dark:text-gray-300 italic line-clamp-3 font-medium">
                                "{quoteContext}"
                            </p>
                            <button
                                onClick={() => setQuoteContext("")}
                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 mt-0.5"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={
                                replyingTo
                                    ? t("note_detail.write_reply")
                                    : t("note_detail.write_discussion_short")
                            }
                            className="flex-1 px-4 py-3 bg-white dark:bg-[#13111C] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-[48px] custom-scrollbar text-gray-900 dark:text-gray-100"
                        />
                        <button
                            onClick={() => {
                                if (replyingTo) {
                                    handleReplySubmit(replyingTo.id);
                                } else {
                                    // Jika bukan membalas, kita gunakan handleComment tapi dengan replyText
                                    // Atau ubah handleComment agar lebih fleksibel.
                                    // Untuk sekarang, kita panggil handleReplySubmit tanpa parentId jika didukung API
                                    // atau sesuaikan state-nya.
                                    // Ternyata di side panel dia pakai replyText, maka kita buat handleCommentFromPanel
                                    handleCommentFromPanel();
                                }
                            }}
                            disabled={
                                !replyText.trim() || isSubmittingReply
                            }
                            className="w-12 h-12 bg-primary hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-primary/20 shrink-0"
                        >
                            {isSubmittingReply ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Highlight Menu */}
            {showHighlightMenu && selectionRect && (
                <div
                    className={`fixed z-[70] bg-white dark:bg-[#2D2B3F] text-gray-900 dark:text-white px-3 py-2 border border-gray-100 dark:border-white/10 backdrop-blur-md shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] flex items-center gap-1 ${(window as any).ReactNativeWebView ? 'bottom-20 left-1/2 transform -translate-x-1/2 rounded-full px-4 py-3 min-w-[max-content]' : 'transform -translate-x-1/2 -translate-y-full rounded-xl'}`}
                    style={!(window as any).ReactNativeWebView ? {
                        top: selectionRect.top - 15,
                        left: selectionRect.left + selectionRect.width / 2,
                    } : {}}
                >
                    {!showColorPicker ? (
                        <>
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleRespondClick();
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 text-[13px] font-['Lexend_Deca'] font-bold hover:text-primary transition-colors hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg"
                            >
                                <MessageSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
                                {t("note_detail.respond_btn") || "RESPOND"}
                            </button>
                            <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-1"></div>
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowColorPicker(true);
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 text-[13px] font-['Lexend_Deca'] font-bold hover:text-amber-500 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg"
                            >
                                <Highlighter className="w-4 h-4" strokeWidth={2.5} />{t("note_detail.highlight_btn")}</button>
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5 px-1 animate-in fade-in zoom-in-95 duration-200">
                            {Object.entries(HIGHLIGHT_COLORS).map(([color, val]) => (
                                <button
                                    key={color}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleHighlightClick(color);
                                    }}
                                    className="w-6 h-6 rounded-full hover:scale-110 transition-transform flex items-center justify-center border border-black/5 dark:border-white/10"
                                    style={{ backgroundColor: val.bg }}
                                    title={val.label}
                                />
                            ))}
                            <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-1"></div>
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowColorPicker(false);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-6 border-transparent border-t-white dark:border-t-[#2D2B3F]"></div>
                </div>
            )}

            {/* Highlight Tooltip (Delete) */}
            {activeHighlightId && (
                (() => {
                    const mark = document.querySelector(`mark[data-highlight-id="${activeHighlightId}"]`);
                    if (!mark) return null;
                    const rect = mark.getBoundingClientRect();
                    return (
                        <div
                            className="highlight-tooltip fixed z-[60] transform -translate-x-1/2 -translate-y-full bg-white dark:bg-[#2D2B3F] px-2 py-1.5 rounded-lg shadow-xl border border-gray-100 dark:border-white/10 flex gap-2"
                            style={{
                                top: rect.top - 10,
                                left: rect.left + rect.width / 2,
                            }}
                        >
                            <button
                                onClick={() => handleDeleteHighlight(activeHighlightId)}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs font-['Lexend_Deca'] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                            >
                                <Trash2 className="w-3 h-3" /> {t("note_detail.delete_highlight")}
                            </button>
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-white dark:border-t-[#2D2B3F]"></div>
                        </div>
                    );
                })()
            )}

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-[70] p-4 bg-gray-900 text-white rounded-full shadow-xl hover:bg-black hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Kembali ke atas"
                >
                    <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                </button>
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultTab={authTab}
            />

            {/* Modal Share */}
            {showShareModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1C1A29] rounded-[32px] w-full max-w-md max-h-[90vh] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.6)] overflow-hidden border border-white dark:border-white/5 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col">
                        {/* Header with Icon - Identical to Report Modal */}
                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 pb-5 text-center border-b border-indigo-100/50 dark:border-white/5 shrink-0">
                            <div className="w-14 h-14 bg-white dark:bg-[#252336] text-indigo-600 dark:text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm dark:shadow-none border border-indigo-200/30 dark:border-primary/20">
                                <Share2 className="w-7 h-7" strokeWidth={2.5} />
                            </div>
                            <h3 className="font-['Lexend_Deca'] font-extrabold text-xl text-gray-900 dark:text-gray-100 mb-1">{t("note_detail.share_note")}</h3>
                            <p className="font-['Manrope'] text-[13px] text-gray-600 font-bold px-6">
                                {t("note_detail.share_cta")}
                            </p>
                        </div>

                        <div className="p-6 pt-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Social Preview Card - Enhanced Contrast */}
                            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-3 mb-6 flex gap-3 text-left">
                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white">
                                    {note.thumbnail ? (
                                        <img
                                            src={note.thumbnail}
                                            alt={note.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <DefaultThumbnail 
                                            className="w-full h-full" 
                                            subject={note.mapel || note.mataPelajaran}
                                            title={note.title}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <h4 className="font-['Lexend_Deca'] font-bold text-[12.5px] text-gray-900 dark:text-gray-100 truncate mb-0.5">
                                        {note.title}
                                    </h4>
                                    <p className="font-['Manrope'] text-[10.5px] text-gray-600 font-bold line-clamp-2 leading-relaxed opacity-80">
                                        {note.content
                                            ?.replace(/<[^>]*>/g, "")
                                            .substring(0, 80)}
                                        ...
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-y-6 gap-x-3 mb-6">
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://wa.me/?text=${encodeURIComponent(`${note.title} - Baca di Ba-Yu: ${window.location.href}`)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-[#25D366] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-green-100/50 dark:shadow-green-900/20 group-hover:-translate-y-1 transition-all">
                                        <MessageCircle className="w-5 h-5 fill-white" />
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        WA
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Cek catatan seru ini: ${note.title}`)}&url=${encodeURIComponent(window.location.href)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-black text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-gray-200/50 dark:shadow-black/30 group-hover:-translate-y-1 transition-all">
                                        <Twitter className="w-5 h-5 fill-white" />
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        X
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-[#1877F2] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20 group-hover:-translate-y-1 transition-all">
                                        <Facebook className="w-5 h-5 fill-white" />
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        FB
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(note.title)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-[#0088cc] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-sky-100/50 dark:shadow-sky-900/20 group-hover:-translate-y-1 transition-all">
                                        <Send className="w-5 h-5 fill-white" />
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        Tele
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-[#0077b5] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none group-hover:-translate-y-1 transition-all">
                                        <svg
                                            className="w-5 h-5 fill-current"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        LinkedIn
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://lineit.line.me/share/ui?url=${encodeURIComponent(window.location.href)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-[#00b900] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-green-100 dark:shadow-none group-hover:-translate-y-1 transition-all">
                                        <svg
                                            className="w-6 h-6 fill-current"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M24 10.304c0-5.232-5.383-9.488-12-9.488s-12 4.256-12 9.488c0 4.69 4.27 8.604 10.046 9.351.391.084.924.258 1.057.592.121.304.079.78.039 1.088l-.171 1.026c-.052.311-.252 1.218 1.086.665 1.338-.553 7.211-4.248 9.842-7.272 1.775-1.954 2.046-3.791 2.101-5.45zm-14.779 4.394c0 .356-.289.646-.645.646h-1.638c-.356 0-.645-.29-.645-.646v-3.327h-1.638c-.356 0-.645-.29-.645-.646s.289-.646.645-.646h4.566c.356 0 .645.29.645.646s-.289.646-.645.646h-1.639v3.327zm2.427 0c0 .356-.289.646-.645.646s-.645-.29-.645-.646v-4.619c0-.356.289-.646.645-.646s.645.29.645.646v4.619zm5.351 0c0 .324-.131.62-.365.836l-.004.004-.004.003c-.074.068-.162.119-.257.149-.071.023-.146.035-.224.035-.045 0-.089-.004-.133-.013-.105-.021-.202-.068-.282-.132l-.004-.004-2.883-2.612v1.738c0 .356-.289.646-.645.646s-.645-.29-.645-.646v-4.619c0-.356.289-.646.645-.646.216 0 .408.107.526.271l2.977 2.696v-1.748c0-.356.289-.646.645-.646s.645.29.645.646v4.619zm3.504-1.287h-1.639v-1.042h1.639c.356 0 .645-.29.645-.646s-.289-.646-.645-.646h-1.639v-1.041h1.639c.356 0 .645-.29.645-.646s-.289-.646-.645-.646h-2.928c-.356 0-.645.29-.645.646v4.619c0 .356.289.646.645.646h2.928c.356 0 .645-.29.645-.646s-.289-.646-.645-.646z" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        Line
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(note.title)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-[#bd081c] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-red-100 dark:shadow-none group-hover:-translate-y-1 transition-all">
                                        <svg
                                            className="w-5 h-5 fill-current"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12.017 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        Pinterest
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `mailto:?subject=${encodeURIComponent(note.title)}&body=${encodeURIComponent(`Cek catatan bermanfaat ini: ${window.location.href}`)}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-11 h-11 bg-gray-600 text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-gray-100 dark:shadow-none group-hover:-translate-y-1 transition-all">
                                        <svg
                                            className="w-5 h-5 fill-none stroke-current"
                                            strokeWidth="2.5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                        Email
                                    </span>
                                </button>
                            </div>

                            <div className="relative group mb-2">
                                <label className="block text-left text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">{t("note_detail.copy_link")}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                                        <Link2 className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        readOnly
                                        value={window.location.href}
                                        className="w-full pl-11 pr-24 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[12.5px] font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                window.location.href,
                                            );
                                            showToast(
                                                t("note_detail.copy_link_copied"),
                                                "success",
                                            );
                                        }}
                                        className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 dark:shadow-none active:scale-95"
                                    >
                                        {t("note_detail.copy_btn")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-50 dark:border-white/5 shrink-0">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="w-full py-3.5 rounded-2xl font-['Lexend_Deca'] font-black text-[14px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                            >{t("note_detail.close_modal")}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Report */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1C1A29] rounded-[32px] w-full max-w-md max-h-[90vh] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden border border-white dark:border-white/5 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col">
                        {/* Header with Icon */}
                        <div className="bg-rose-50 dark:bg-rose-500/10 p-8 pb-5 text-center border-b border-rose-100/50 dark:border-white/5 shrink-0">
                            <div className="w-16 h-16 bg-white dark:bg-[#252336] text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm dark:shadow-none border border-rose-200/30 dark:border-rose-500/20">
                                <Flag className="w-8 h-8" strokeWidth={2.5} />
                            </div>
                            <h3 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-1">
                                {reportTarget?.type === "note" ? t("note_detail.report_note") : t("note_detail.report_comment")}{" "}

                            </h3>
                            <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 font-bold px-6">{t("note_detail.report_help_desc")}</p>
                        </div>

                        <div className="p-8 pt-7 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-['Manrope'] text-[12px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em] mb-2 ml-1">{t("note_detail.report_main_reason")}</label>
                                    <div className="relative group">
                                        <CustomSelect
                                            value={reportReason}
                                            onChange={(val) => setReportReason(val as string)}
                                            options={[
                                                { value: "", label: t("note_detail.report_reason_placeholder") },
                                                { value: "Spam", label: t("note_detail.report_reason_spam") },
                                                { value: "Informasi Palsu", label: t("note_detail.report_reason_inappropriate") },
                                                { value: "Kata Kasar", label: t("note_detail.report_reason_harassment") },
                                                { value: "Pelecehan", label: t("note_detail.report_reason_harassment") },
                                                { value: "Hak Cipta", label: t("note_detail.report_reason_copyright") },
                                                { value: t("note_detail.report_reason_other"), label: t("note_detail.report_reason_other") },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-['Manrope'] text-[12px] font-extrabold text-gray-500 uppercase tracking-[0.1em] mb-2 ml-1">
                                        Detail Tambahan
                                    </label>
                                    <textarea
                                        value={reportDescription}
                                        onChange={(e) =>
                                            setReportDescription(e.target.value)
                                        }
                                        placeholder={t("note_detail.report_desc_placeholder")}
                                        className="w-full px-5 py-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[14.5px] focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-400 focus:bg-white dark:focus:bg-white/10 transition-all resize-none h-32 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-bold hover:border-gray-300 dark:hover:border-white/20"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-10 shrink-0">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-6 py-3.5 rounded-2xl font-['Lexend_Deca'] font-black text-[14px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                >
                                    {t("note_detail.report_cancel")}
                                </button>
                                <button
                                    onClick={handleReportSubmit}
                                    disabled={
                                        isSubmittingReport || !reportReason
                                    }
                                    className="px-6 py-3.5 rounded-2xl font-['Lexend_Deca'] font-black text-[14px] bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingReport ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t("note_detail.report_sending")}
                                        </>
                                    ) : (
                                        t("note_detail.report_send")
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}
                title={confirmConfig.title}
                description={confirmConfig.description}
                variant={confirmConfig.variant}
                onConfirm={confirmConfig.onConfirm}
                cancelText={confirmConfig.cancelText}
                confirmText={confirmConfig.confirmText}
            />
        </>
    );

    if (isAuthenticated) {
        return (
            <>
                <MobileLayout showBottomNav={false}>
                    {noteContent}
                </MobileLayout>
                {modals}
            </>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#13111C]">
            <Navbar variant="default" />
            {noteContent}
            <Footer />
            {modals}
        </div>
    );
}
