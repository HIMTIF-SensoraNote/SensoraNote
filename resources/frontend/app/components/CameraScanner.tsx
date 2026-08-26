import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crop, Image as ImageIcon, ScanText, Copy, Check, Loader2, ChevronDown, RefreshCw, Zap, Download } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface CameraScannerProps {
    onClose: () => void;
}

type Point = { x: number; y: number };
type Step = 'camera' | 'adjust' | 'result';
type ScanMode = 'abjad' | 'braille';

const MODE_LABELS: Record<ScanMode, { short: string; model: string; accent: string }> = {
    abjad:   { short: 'Teks Abjad',   model: 'EasyOCR', accent: '#3b82f6' },
    braille: { short: 'Titik Braille', model: 'YOLO',    accent: '#10b981' },
};

const CameraScanner: React.FC<CameraScannerProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const videoRef        = useRef<HTMLVideoElement>(null);
    const canvasRef       = useRef<HTMLCanvasElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep]           = useState<Step>('camera');
    const [isLoading, setIsLoading] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [imageObj, setImageObj]     = useState<HTMLImageElement | null>(null);
    const [corners, setCorners]       = useState<Point[]>([]);
    const [originalFile, setOriginalFile] = useState<Blob | null>(null);
    const draggingIdxRef = useRef<number | null>(null);
    const [scanMode, setScanMode]         = useState<ScanMode>('abjad');
    const [showModeMenu, setShowModeMenu] = useState(false);
    const [isOcrLoading, setIsOcrLoading]   = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [brailleText, setBrailleText]     = useState('');
    const [ocrError, setOcrError]           = useState<string | null>(null);
    const [isCopied, setIsCopied]           = useState(false);
    const [showOcrSheet, setShowOcrSheet] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);

    useEffect(() => {
        if (step === 'camera') startCamera();
        return () => { if (step === 'camera') stopCamera(); };
    }, [step]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
            alert('Harap berikan izin akses kamera.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject)
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };

    const goToAdjust = useCallback(async (blob: Blob, dataUrl: string) => {
        setOriginalFile(blob);
        const img = new Image(); img.src = dataUrl; img.onload = () => setImageObj(img);
        const tempImg = await new Promise<HTMLImageElement>(res => {
            const i = new Image(); i.onload = () => res(i); i.src = dataUrl;
        });
        const w = tempImg.naturalWidth, h = tempImg.naturalHeight;
        const fallback = [
            { x: w * 0.1, y: h * 0.1 }, { x: w * 0.9, y: h * 0.1 },
            { x: w * 0.9, y: h * 0.9 }, { x: w * 0.1, y: h * 0.9 },
        ];
        setIsLoading(true);
        try {
            const fd = new FormData(); fd.append('file', blob, 'scan.jpg');
            const r = await axios.post('/api/scanner/detect', fd, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            setCorners(r.data?.corners ?? fallback);
        } catch { setCorners(fallback); }
        finally { setIsLoading(false); setStep('adjust'); }
    }, []);

    const captureFromCamera = useCallback(async () => {
        if (!videoRef.current) return;
        const v = videoRef.current, tmp = document.createElement('canvas');
        tmp.width = v.videoWidth; tmp.height = v.videoHeight;
        tmp.getContext('2d')?.drawImage(v, 0, 0);
        const dataUrl = tmp.toDataURL('image/jpeg', 0.9);
        stopCamera();
        await goToAdjust(await (await fetch(dataUrl)).blob(), dataUrl);
    }, [goToAdjust]);

    const openGallery = () => galleryInputRef.current?.click();

    const handleGalleryChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        stopCamera();
        const dataUrl = await new Promise<string>(res => { const r = new FileReader(); r.onload = ev => res(ev.target?.result as string); r.readAsDataURL(file); });
        await goToAdjust(file, dataUrl);
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    }, [goToAdjust]);

    const drawCanvas = useCallback(() => {
        if (!canvasRef.current || !imageObj || corners.length !== 4) return;
        const canvas = canvasRef.current, ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (canvas.width !== imageObj.naturalWidth) canvas.width = imageObj.naturalWidth;
        if (canvas.height !== imageObj.naturalHeight) canvas.height = imageObj.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0,0,0,0.50)';
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(canvas.width, 0); ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height); ctx.closePath();
        ctx.moveTo(corners[0].x, corners[0].y); ctx.lineTo(corners[1].x, corners[1].y); ctx.lineTo(corners[2].x, corners[2].y); ctx.lineTo(corners[3].x, corners[3].y); ctx.closePath();
        ctx.fill('evenodd');

        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = Math.max(1.5, canvas.width * 0.002);
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y); ctx.lineTo(corners[1].x, corners[1].y); ctx.lineTo(corners[2].x, corners[2].y); ctx.lineTo(corners[3].x, corners[3].y); ctx.closePath();
        ctx.stroke();

        const arm = Math.max(22, canvas.width * 0.04), lw = Math.max(3, canvas.width * 0.005);
        const pairs: [Point, Point, Point][] = [
            [corners[0], corners[1], corners[3]], [corners[1], corners[0], corners[2]],
            [corners[2], corners[1], corners[3]], [corners[3], corners[2], corners[0]],
        ];
        pairs.forEach(([pt, a1, a2]) => {
            const d1x = a1.x - pt.x, d1y = a1.y - pt.y, l1 = Math.hypot(d1x, d1y) || 1;
            const d2x = a2.x - pt.x, d2y = a2.y - pt.y, l2 = Math.hypot(d2x, d2y) || 1;
            ctx.strokeStyle = '#22c55e'; ctx.lineWidth = lw; ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pt.x + (d1x / l1) * arm, pt.y + (d1y / l1) * arm);
            ctx.lineTo(pt.x, pt.y);
            ctx.lineTo(pt.x + (d2x / l2) * arm, pt.y + (d2y / l2) * arm);
            ctx.stroke();
            ctx.beginPath(); ctx.arc(pt.x, pt.y, lw * 1.8, 0, 2 * Math.PI);
            ctx.fillStyle = '#22c55e'; ctx.fill();
        });
    }, [imageObj, corners]);

    useEffect(() => { if (step === 'adjust') drawCanvas(); }, [step, drawCanvas]);

    const getCanvasPoint = useCallback((cx: number, cy: number): Point => {
        const canvas = canvasRef.current!, rect = canvas.getBoundingClientRect();
        const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
        const rw = canvas.width * scale, rh = canvas.height * scale;
        const ox = (rect.width - rw) / 2, oy = (rect.height - rh) / 2;
        return {
            x: Math.max(0, Math.min(canvas.width,  ((cx - rect.left - ox) / rw) * canvas.width)),
            y: Math.max(0, Math.min(canvas.height, ((cy - rect.top  - oy) / rh) * canvas.height)),
        };
    }, []);

    const hitRadius = useCallback(() => !canvasRef.current ? 60 : Math.max(50, canvasRef.current.width * 0.07), []);

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const pos = getCanvasPoint(e.clientX, e.clientY), r = hitRadius();
        for (let i = 0; i < corners.length; i++) {
            const dx = pos.x - corners[i].x, dy = pos.y - corners[i].y;
            if (dx * dx + dy * dy < r * r) { draggingIdxRef.current = i; (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId); break; }
        }
    }, [corners, getCanvasPoint, hitRadius]);

    const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (draggingIdxRef.current === null) return;
        e.preventDefault();
        const pos = getCanvasPoint(e.clientX, e.clientY);
        setCorners(prev => { const next = [...prev]; next[draggingIdxRef.current!] = pos; return next; });
    }, [getCanvasPoint]);

    const onPointerUp = useCallback(() => { draggingIdxRef.current = null; }, []);

    const processCrop = async () => {
        if (!originalFile || corners.length !== 4) return;
        setIsLoading(true);
        try {
            const fd = new FormData(); fd.append('file', originalFile, 'scan.jpg'); fd.append('corners', JSON.stringify(corners));
            const r = await axios.post('/api/scanner/crop', fd, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            const imgSrc = r.data?.image || (r.data?.image_base64 ? `data:${r.data.mime_type || 'image/jpeg'};base64,${r.data.image_base64}` : null);
            if (imgSrc) {
                setScanResult(imgSrc);
                setStep('result');
            } else {
                throw new Error(r.data?.message || 'Gagal memproses crop.');
            }
        } catch { alert('Gagal memotong gambar. Coba lagi.'); }
        finally { setIsLoading(false); }
    };

    const handleOcr = async () => {
        if (!scanResult) return;
        setIsOcrLoading(true); setOcrError(null); setExtractedText(''); setBrailleText('');
        try {
            const blob = await (await fetch(scanResult)).blob();
            const fd = new FormData(); fd.append('file', blob, 'crop.jpg');
            const ep = scanMode === 'abjad' ? '/api/scanner/ocr' : '/api/scanner/braille-ocr';
            const r = await axios.post(ep, fd, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            const text = r.data?.text ?? '';
            let braille = '';
            setExtractedText(text);
            if (!text) setOcrError(`Tidak ada ${scanMode === 'abjad' ? 'teks alfabet' : 'titik braille'} yang terbaca.`);
            
            if (text && scanMode === 'abjad') {
                try { 
                    const rb = await axios.post('/api/braille/text-to-braille', { text }, { withCredentials: true }); 
                    braille = rb.data?.braille ?? '';
                    setBrailleText(braille); 
                } catch {}
            }
            
            // Navigate ke halaman baru dan bawa hasil teks, braille, serta foto crop
            onClose(); // Tutup modal kamera
            navigate('/scan-result', { 
                state: { 
                    extractedText: text, 
                    brailleText: braille, 
                    scanMode, 
                    imageSrc: scanResult 
                } 
            });
            
        } catch (err: any) { 
            setOcrError(err.response?.data?.message || 'Gagal terhubung ke AI Service.'); 
            setShowOcrSheet(true); // Biarkan error sheet muncul jika gagal
        }
        finally { setIsOcrLoading(false); }
    };

    const copyToClipboard = () => {
        const t = brailleText || extractedText; if (!t) return;
        navigator.clipboard.writeText(t); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
    };

    const retake = () => { setScanResult(null); setOriginalFile(null); setImageObj(null); setExtractedText(''); setBrailleText(''); setOcrError(null); setShowOcrSheet(false); setStep('camera'); };

    const cm = MODE_LABELS[scanMode];

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black overscroll-none touch-none select-none">
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryChange} />

            <AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center gap-4">
                        <RefreshCw className="w-10 h-10 animate-spin text-green-400" />
                        <p className="text-white font-semibold">Mendeteksi Dokumen...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CAMERA */}
            {step === 'camera' && (
                <div className="absolute inset-0 flex flex-col">
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />

                    {/* Top bar */}
                    <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-2">
                        <button onClick={() => setShowExitConfirm(true)}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Teks → Braille</span>
                        </div>
                        <div className="w-10" />
                    </div>

                    {/* Document guide */}
                    <div className="flex-1 flex items-center justify-center px-10">
                        <div className="w-full max-w-xs aspect-[3/4] relative">
                            {(['top-0 left-0 border-t-[2.5px] border-l-[2.5px] rounded-tl-xl',
                               'top-0 right-0 border-t-[2.5px] border-r-[2.5px] rounded-tr-xl',
                               'bottom-0 left-0 border-b-[2.5px] border-l-[2.5px] rounded-bl-xl',
                               'bottom-0 right-0 border-b-[2.5px] border-r-[2.5px] rounded-br-xl'
                            ] as string[]).map((cls, i) => (
                                <div key={i} className={`absolute w-9 h-9 border-white/75 ${cls}`} />
                            ))}
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="relative z-10 flex items-center justify-around px-10 pb-14 pt-6">
                        <button onClick={openGallery} className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[10px] text-white/60 font-medium">Galeri</span>
                        </button>
                        <button onClick={captureFromCamera}
                            className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center active:scale-95 transition-transform">
                            <div className="w-14 h-14 rounded-full bg-white" />
                        </button>
                        <div className="w-12" />
                    </div>
                </div>
            )}

            {/* ADJUST */}
            {step === 'adjust' && (
                <div className="absolute inset-0 flex flex-col bg-black">
                    <div className="flex items-center justify-between px-5 pt-12 pb-3 z-10 relative">
                        <button onClick={() => setShowExitConfirm(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-white text-sm font-bold">Sesuaikan Sudut</span>
                        <div className="w-10" />
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        {imageObj && <img src={imageObj.src} className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" alt="" />}
                        <canvas ref={canvasRef}
                            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                            className="absolute inset-0 w-full h-full object-contain touch-none" />
                    </div>
                    <div className="px-5 pb-12 pt-4 flex gap-3 z-10 relative">
                        <button onClick={() => setShowRetakeConfirm(true)}
                            className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white text-sm font-bold border border-white/10 active:scale-95 transition-transform">
                            Ulangi
                        </button>
                        <button onClick={processCrop}
                            className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                            <Crop className="w-4 h-4" /> Potong
                        </button>
                    </div>
                </div>
            )}

            {/* RESULT */}
            {step === 'result' && scanResult && (
                <div className="absolute inset-0 flex flex-col bg-[#0a0a0a]">
                    <div className="flex items-center justify-between px-5 pt-12 pb-3 z-10 relative">
                        <button onClick={() => setShowExitConfirm(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-white text-sm font-bold">Hasil Scan</span>
                        <div className="w-10" />
                    </div>
                    <div className="flex-1 flex items-center justify-center p-5 overflow-hidden">
                        <img src={scanResult} alt="Hasil Scan" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                    </div>
                    <div className="px-5 pb-12 pt-2 space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-white/70 text-xs font-medium">Teks → Braille</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowRetakeConfirm(true)}
                                className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white text-sm font-bold border border-white/10 active:scale-95 transition-transform">
                                Ulangi
                            </button>
                            <button onClick={handleOcr} disabled={isOcrLoading}
                                className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-transform"
                                style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
                                {isOcrLoading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                                    : <><Zap className="w-4 h-4" /> Scan Gambar</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RESULT SHEET */}
            <AnimatePresence>
                {showOcrSheet && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                        className="absolute bottom-0 left-0 right-0 z-[200] bg-white dark:bg-[#161622] rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.6)] max-h-[75vh] flex flex-col">
                        <div className="w-10 h-1 mx-auto mt-3 mb-1 bg-gray-200 dark:bg-white/10 rounded-full" />
                        <div className="flex items-center justify-between px-5 py-3">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Hasil {scanMode === 'abjad' ? 'Teks Abjad' : 'OCR Braille'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {extractedText && (
                                    <button onClick={copyToClipboard}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border"
                                        style={{ color: cm.accent, borderColor: `${cm.accent}40`, background: `${cm.accent}15` }}>
                                        {isCopied ? <><Check className="w-3.5 h-3.5" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                                    </button>
                                )}
                                <button onClick={() => setShowOcrSheet(false)}
                                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-2 space-y-3">
                            {ocrError && <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 rounded-2xl text-red-600 dark:text-red-400 text-sm">{ocrError}</div>}
                            {extractedText ? (
                                <>
                                    <div className="p-4 bg-gray-50 dark:bg-black/20 border border-gray-200/60 dark:border-white/5 rounded-2xl">
                                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Teks terbaca</p>
                                        <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium text-gray-800 dark:text-gray-200">{extractedText}</p>
                                    </div>
                                    {brailleText && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-400/20 rounded-2xl">
                                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Braille Unicode</p>
                                            <p className="whitespace-pre-wrap leading-relaxed text-2xl text-gray-900 dark:text-amber-50">{brailleText}</p>
                                        </div>
                                    )}
                                </>
                            ) : !ocrError && <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">Tidak ada teks yang terdeteksi.</p>}
                        </div>
                        <div className="px-5 pb-10 pt-3">
                            <button onClick={() => setShowOcrSheet(false)}
                                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm active:scale-95 transition-transform"
                                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                                Selesai
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <ConfirmDialog
                isOpen={showExitConfirm}
                onOpenChange={setShowExitConfirm}
                className="!z-[10000]"
                overlayClassName="!z-[10000]"
                title="Keluar dari Kamera?"
                description="Anda belum menyimpan hasil scan ini. Jika Anda keluar, gambar yang telah diambil akan hilang."
                onConfirm={onClose}
                confirmText="Ya, Keluar"
                cancelText="Batal"
                variant="danger"
            />

            <ConfirmDialog
                isOpen={showRetakeConfirm}
                onOpenChange={setShowRetakeConfirm}
                className="!z-[10000]"
                overlayClassName="!z-[10000]"
                title="Ulangi Pengambilan Gambar?"
                description="Gambar yang sudah Anda ambil akan dihapus. Anda yakin ingin memotret ulang?"
                onConfirm={() => {
                    setShowRetakeConfirm(false);
                    retake();
                }}
                confirmText="Ya, Ulangi"
                cancelText="Batal"
                variant="danger"
            />
        </div>,
        document.body
    );
};

export default CameraScanner;
