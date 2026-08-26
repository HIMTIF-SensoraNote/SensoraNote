import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Info, 
  Volume2, 
  Square, 
  Sparkles, 
  FileEdit, 
  Loader2, 
  FileText, 
  ArrowRight,
  Download,
  Printer
} from 'lucide-react';
import axios from 'axios';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MobileLayout } from '../components/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { downloadBraillePdf } from '../utils/braillePdf';

export default function ScanResultPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { extractedText?: string, brailleText?: string, scanMode?: 'abjad' | 'braille', imageSrc?: string } | null;

    const rawExtractedText = state?.extractedText || '';
    const initialBraille = state?.brailleText || '';
    const imageSrc = state?.imageSrc;
    const scanMode = state?.scanMode || 'abjad';

    const [currentBraille, setCurrentBraille] = useState<string>(initialBraille);
    const [polishedText, setPolishedText] = useState<string | null>(null);
    const [polishedTitle, setPolishedTitle] = useState<string>('Catatan Hasil Scan');
    const [isPolishing, setIsPolishing] = useState(false);
    const [polishError, setPolishError] = useState<string | null>(null);

    const [isCopiedText, setIsCopiedText] = useState(false);
    const [isCopiedBraille, setIsCopiedBraille] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const isSpeakingRef = useRef(false);

    // Auto-polish with AI on initial load if text is available
    useEffect(() => {
        if (rawExtractedText && !polishedText && !isPolishing) {
            handlePolishText();
        }
    }, [rawExtractedText]);

    // Translate to braille if not provided initially
    useEffect(() => {
        if (!currentBraille && rawExtractedText) {
            axios.post('/api/braille/text-to-braille', { text: rawExtractedText }, { withCredentials: true })
                .then(res => {
                    if (res.data?.braille) {
                        setCurrentBraille(res.data.braille);
                    }
                })
                .catch(err => {
                    console.warn('Gagal memuat braille awal:', err);
                });
        }
    }, [rawExtractedText, currentBraille]);

    // Clean up speech synthesis on unmount
    useEffect(() => {
        return () => {
            isSpeakingRef.current = false;
            window.speechSynthesis.cancel();
        };
    }, []);

    const handlePolishText = async () => {
        if (!rawExtractedText || isPolishing) return;
        setIsPolishing(true);
        setPolishError(null);

        try {
            const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.post(
                '/api/v1/scanner/polish',
                { text: rawExtractedText },
                { headers, withCredentials: true }
            );

            if (res.data?.status === 'success' && res.data?.polished_text) {
                setPolishedText(res.data.polished_text);
                if (res.data.title) {
                    setPolishedTitle(res.data.title);
                }
                // Update braille translation with polished text
                try {
                    const brailleRes = await axios.post('/api/braille/text-to-braille', { text: res.data.polished_text }, { withCredentials: true });
                    if (brailleRes.data?.braille) {
                        setCurrentBraille(brailleRes.data.braille);
                    }
                } catch (e) {
                    console.warn('Gagal perbarui braille:', e);
                }
            } else {
                throw new Error(res.data?.message || 'Gagal merapikan teks.');
            }
        } catch (err: any) {
            console.error('Polish error:', err);
            const msg = err?.response?.data?.message || err?.message || 'Gagal merapikan teks dengan AI.';
            setPolishError(msg);
        } finally {
            setIsPolishing(false);
        }
    };

    if (!state) {
        return (
            <MobileLayout hideSidebar={true} hideTopNav={true} hideMobileTopNav={true} showBottomNav={false}>
                <div className="flex flex-col h-[60vh] items-center justify-center text-center p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-4">
                        <FileText className="w-7 h-7" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-bold mb-4 font-['Lexend_Deca']">
                        Tidak ada data hasil scan yang ditemukan.
                    </p>
                    <button 
                        onClick={() => navigate('/home')} 
                        className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 transition-all"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </MobileLayout>
        );
    }

    const activeText = polishedText || rawExtractedText;

    const copyText = () => {
        if (!activeText) return;
        navigator.clipboard.writeText(activeText);
        setIsCopiedText(true);
        setTimeout(() => setIsCopiedText(false), 2000);
    };

    const copyBraille = () => {
        if (!currentBraille) return;
        navigator.clipboard.writeText(currentBraille);
        setIsCopiedBraille(true);
        setTimeout(() => setIsCopiedBraille(false), 2000);
    };

    const handleDownloadBraillePdf = async () => {
        if (!currentBraille || isDownloadingPdf) return;
        setIsDownloadingPdf(true);
        try {
            await downloadBraillePdf({
                title: polishedTitle || 'Catatan Hasil Scan',
                brailleText: currentBraille,
                originalText: activeText,
            });
        } catch (err: any) {
            console.error('Gagal unduh Braille PDF:', err);
            alert(err?.message || 'Gagal membuat file PDF Braille.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // Text to Speech
    const playText = () => {
        const textToSpeak = polishedText || rawExtractedText || '';
        if (!textToSpeak) return;
        
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        window.speechSynthesis.cancel();

        // Bersihkan teks dari format markdown dan latex
        const cleanText = textToSpeak
            .replace(/\$\$[\s\S]*?\$\$/g, ' Rumus ')
            .replace(/\$[^$]*\$/g, '')
            .replace(/[*#`_~>-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsPlaying(true);
        };
        utterance.onend = () => {
            setIsPlaying(false);
        };
        utterance.onerror = (e) => {
            console.error('SpeechSynthesis error:', e);
            setIsPlaying(false);
        };

        setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
    };

    // Navigate to Upload Note page with prefilled data
    const handleUploadToNote = () => {
        navigate('/upload', {
            state: {
                prefillTitle: polishedTitle || 'Catatan Hasil Scan',
                prefillContent: activeText,
            }
        });
    };

    // LaTeX + Markdown Parser Helper
    const renderMarkdownAndLatex = (content: string) => {
        if (!content) return null;

        const lines = content.split('\n');

        return (
            <div className="space-y-3.5 text-gray-800 dark:text-gray-200 text-[14.5px] leading-relaxed font-['Manrope']">
                {lines.map((line, lineIdx) => {
                    const trimmed = line.trim();

                    if (!trimmed) {
                        return <div key={lineIdx} className="h-2" />;
                    }

                    // Block LaTeX: $$formula$$
                    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
                        const formula = trimmed.slice(2, -2).trim();
                        try {
                            const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
                            return (
                                <div 
                                    key={lineIdx} 
                                    className="my-3 p-3 rounded-xl bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/10 overflow-x-auto text-center font-serif text-base"
                                    dangerouslySetInnerHTML={{ __html: html }} 
                                />
                            );
                        } catch {
                            return <pre key={lineIdx} className="my-2 p-2 bg-gray-100 dark:bg-white/5 rounded text-xs font-mono">{trimmed}</pre>;
                        }
                    }

                    // Headings: #, ##, ###, ####, #####, ######
                    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
                    if (headingMatch) {
                        const level = headingMatch[1].length;
                        const text = headingMatch[2].replace(/\s*#+$/, '');

                        if (level === 1) {
                            return (
                                <h1 key={lineIdx} className="font-['Lexend_Deca'] font-black text-[20px] text-gray-900 dark:text-white mt-6 pb-2 border-b-2 border-primary/40">
                                    {renderInlineFormatting(text)}
                                </h1>
                            );
                        } else if (level === 2) {
                            return (
                                <h2 key={lineIdx} className="font-['Lexend_Deca'] font-extrabold text-[18px] text-blue-600 dark:text-blue-400 mt-5 pb-1 border-b border-blue-100 dark:border-blue-500/20">
                                    {renderInlineFormatting(text)}
                                </h2>
                            );
                        } else if (level === 3) {
                            return (
                                <h3 key={lineIdx} className="font-['Lexend_Deca'] font-bold text-[16px] text-gray-900 dark:text-white mt-4 pb-1 border-b border-gray-100 dark:border-white/5">
                                    {renderInlineFormatting(text)}
                                </h3>
                            );
                        } else {
                            return (
                                <h4 key={lineIdx} className="font-['Lexend_Deca'] font-bold text-[15px] text-blue-600 dark:text-blue-400 mt-3 mb-1">
                                    {renderInlineFormatting(text)}
                                </h4>
                            );
                        }
                    }

                    // Bullet lists (- or *)
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return (
                            <div key={lineIdx} className="flex items-start gap-2.5 pl-2">
                                <span className="text-primary font-bold text-base mt-0.5">•</span>
                                <span className="flex-1">{renderInlineFormatting(trimmed.substring(2))}</span>
                            </div>
                        );
                    }

                    // Numbered lists (1. 2.)
                    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
                    if (numMatch) {
                        return (
                            <div key={lineIdx} className="flex items-start gap-2.5 pl-2">
                                <span className="text-primary font-bold text-xs mt-1 min-w-[18px] px-1 py-0.5 rounded bg-primary/10 text-center">{numMatch[1]}</span>
                                <span className="flex-1">{renderInlineFormatting(numMatch[2])}</span>
                            </div>
                        );
                    }

                    return <p key={lineIdx} className="leading-relaxed">{renderInlineFormatting(line)}</p>;
                })}
            </div>
        );
    };

    // Helper for inline styles (bold, code, inline LaTeX $...$)
    const renderInlineFormatting = (text: string) => {
        const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|\*\*.*?\*\*|`.*?`)/g);

        return parts.map((part, index) => {
            // Inline LaTeX $...$
            if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$') && part.length > 2) {
                const formula = part.slice(1, -1);
                try {
                    const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
                    return <span key={index} className="inline-block px-1 font-serif text-[15px]" dangerouslySetInnerHTML={{ __html: html }} />;
                } catch {
                    return <code key={index} className="text-xs bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">{part}</code>;
                }
            }

            // Bold **...**
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }

            // Inline Code `...`
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={index} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-primary font-mono text-[13px]">
                        {part.slice(1, -1)}
                    </code>
                );
            }

            return part;
        });
    };

    return (
        <MobileLayout hideSidebar={true} hideTopNav={true} hideMobileTopNav={true} showBottomNav={false}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col font-['Manrope']">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowExitConfirm(true)} 
                            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Kembali ke Beranda"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                Hasil Scan Dokumen
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Didukung AI Text Restructuring & KaTeX LaTeX
                            </p>
                        </div>
                    </div>

                    {/* Action: Upload to Note Button */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleUploadToNote}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-['Lexend_Deca'] font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                            <FileEdit className="w-4 h-4" />
                            <span>Jadikan Catatan</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                        </button>
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={showExitConfirm}
                    onOpenChange={setShowExitConfirm}
                    title="Keluar dari Hasil Scan?"
                    description="Anda akan kembali ke halaman utama. Pastikan Anda telah menyalin atau menjadikannya catatan."
                    onConfirm={() => navigate('/home')}
                    confirmText="Ya, Keluar"
                    cancelText="Batal"
                    variant="danger"
                />

                {/* Scanned Image Preview Card */}
                {imageSrc && (
                    <div className="mb-6 max-w-sm mx-auto">
                        <img 
                            src={imageSrc} 
                            alt="Scanned Document" 
                            className="w-full h-auto max-h-56 object-contain rounded-2xl shadow-sm border border-gray-200/80 dark:border-white/10 bg-black/5" 
                        />
                    </div>
                )}

                {/* Results Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                    
                    {/* LEFT COLUMN: RESTRUCTURED TEXT (MARKDOWN & LATEX) */}
                    <div className="flex flex-col bg-white dark:bg-[#161424] rounded-2xl border border-gray-200/70 dark:border-white/5 shadow-sm p-5 sm:p-6 overflow-hidden">
                        
                        {/* Column Header */}
                        <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
                            <h2 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 font-['Lexend_Deca'] flex items-center gap-2">
                                <span>Teks Terbaca (Abjad)</span>
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    <Sparkles className="w-3 h-3" /> Markdown & LaTeX
                                </span>
                            </h2>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-white/5 shrink-0">
                            <button
                                onClick={handlePolishText}
                                disabled={isPolishing || !rawExtractedText}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    isPolishing
                                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                        : 'bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                }`}
                                title="Rapikan ulang dengan Gemini AI"
                            >
                                {isPolishing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>AI sedang merapikan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Rapikan Ulang AI</span>
                                    </>
                                )}
                            </button>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={playText} 
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-purple-400/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors cursor-pointer"
                                >
                                    {isPlaying ? <><Square className="w-3.5 h-3.5" fill="currentColor" /> Stop</> : <><Volume2 className="w-3.5 h-3.5" /> Putar Suara</>}
                                </button>

                                <button 
                                    onClick={copyText} 
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-blue-400/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer"
                                >
                                    {isCopiedText ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                                </button>
                            </div>
                        </div>

                        {/* Content Scroll Container */}
                        <div className="flex-1 bg-gray-50/80 dark:bg-black/20 rounded-2xl p-4 sm:p-5 overflow-y-auto border border-gray-200/60 dark:border-white/5 custom-scrollbar min-h-0">
                            {isPolishing && !polishedText ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 font-['Lexend_Deca']">
                                        Sensora AI sedang merapikan teks...
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                        Memperbaiki typo OCR, menyusun heading, dan memformat rumus LaTeX.
                                    </p>
                                </div>
                            ) : activeText ? (
                                <div>
                                    {renderMarkdownAndLatex(activeText)}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                                    <Info className="w-4 h-4 mr-2" /> Tidak ada teks yang terbaca.
                                </div>
                            )}

                            {polishError && (
                                <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                                    {polishError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: BRAILLE TRANSLATION */}
                    <div className="flex flex-col bg-white dark:bg-[#161424] rounded-2xl border border-gray-200/70 dark:border-white/5 shadow-sm p-5 sm:p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-2">
                            <h2 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 font-['Lexend_Deca'] flex items-center gap-2">
                                <span>Terjemahan Huruf Braille</span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Siap Cetak A4
                                </span>
                            </h2>
                            {currentBraille && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleDownloadBraillePdf}
                                        disabled={isDownloadingPdf}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-500/30 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                                        title="Unduh dokumen Braille PDF A4 siap print/emboss"
                                    >
                                        {isDownloadingPdf ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Menyiapkan PDF...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Printer className="w-3.5 h-3.5" />
                                                <span>Unduh PDF Braille</span>
                                            </>
                                        )}
                                    </button>

                                    <button 
                                        onClick={copyBraille} 
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                        title="Salin simbol Braille"
                                    >
                                        {isCopiedBraille ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 bg-gray-50/80 dark:bg-black/20 rounded-2xl p-4 sm:p-5 overflow-y-auto border border-gray-200/60 dark:border-white/5 custom-scrollbar min-h-0">
                            {currentBraille ? (
                                <p className="text-gray-800 dark:text-gray-200 text-lg sm:text-2xl leading-loose tracking-widest break-words font-serif select-text" style={{ wordSpacing: '0.6em' }}>
                                    {currentBraille}
                                </p>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                                    <Info className="w-4 h-4 mr-2" /> {scanMode === 'braille' ? 'Tidak ada braille' : 'Terjemahan tidak tersedia'}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </MobileLayout>
    );
}