import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { RefreshCw, ScanText, Loader2, X, Copy, Check, ZapOff, Shield, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VisionOcrProps {
    onClose: () => void;
}

type Point = { x: number; y: number }; // fraksi 0..1 relatif terhadap gambar
type Corners = { tl: Point; tr: Point; br: Point; bl: Point };
type AppState = 'camera' | 'adjust' | 'preview';

// Posisi default 4 sudut kalau OpenCV gagal menebak bentuk kertas
const DEFAULT_CORNERS: Corners = {
    tl: { x: 0.08, y: 0.08 },
    tr: { x: 0.92, y: 0.08 },
    br: { x: 0.92, y: 0.92 },
    bl: { x: 0.08, y: 0.92 },
};

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export default function VisionOcr({ onClose }: VisionOcrProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null); // menyimpan foto full-res mentah (belum di-crop)
    const streamRef = useRef<MediaStream | null>(null);
    const adjustContainerRef = useRef<HTMLDivElement>(null);
    const dragCornerRef = useRef<keyof Corners | null>(null);

    const [appState, setAppState] = useState<AppState>('camera');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const [rawImageUrl, setRawImageUrl] = useState<string | null>(null); // foto mentah untuk layar adjust
    const [cropCorners, setCropCorners] = useState<Corners>(DEFAULT_CORNERS);

    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null); // hasil setelah warp
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const [isOpenCvLoaded, setIsOpenCvLoaded] = useState(false);

    // 1. MEMUAT OPENCV.JS (dipakai untuk tebakan awal sudut kertas + perspective warp)
    useEffect(() => {
        const loadOpenCV = () => {
            if ((window as any).cv && (window as any).cv.Mat) {
                setIsOpenCvLoaded(true);
                return;
            }
            if (document.getElementById('opencv-script-tag')) return;

            const script = document.createElement('script');
            script.id = 'opencv-script-tag';
            script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
            script.async = true;

            script.onload = () => {
                const checkReady = setInterval(() => {
                    if ((window as any).cv && (window as any).cv.Mat) {
                        clearInterval(checkReady);
                        setIsOpenCvLoaded(true);
                    }
                }, 100);
            };

            script.onerror = () => setError("Gagal mengunduh modul Scanner AI.");
            document.body.appendChild(script);
        };
        loadOpenCV();
    }, []);

    // 2. KONTROL KAMERA
    const startCamera = async () => {
        setError(null);
        setCapturedBlob(null);
        setPreviewUrl(null);
        setRawImageUrl(null);
        setExtractedText('');
        setAppState('camera');

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = mediaStream;
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Tidak dapat mengakses kamera.');
        }
    };

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setStream(null);
    }, []);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [stopCamera]);

    // =========================================================================
    // 3. TEBAKAN AWAL SUDUT KERTAS (one-shot, dijalankan sekali setelah jepret,
    //    BUKAN live loop) - hasilnya cuma titik awal, user tetap bisa geser manual
    // =========================================================================
    const detectCorners = (sourceCanvas: HTMLCanvasElement): Corners | null => {
        const cv = (window as any).cv;
        if (!cv || !cv.Mat) return null;

        const W = 480;
        const H = Math.max(1, Math.round((W * sourceCanvas.height) / sourceCanvas.width));
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = W;
        tempCanvas.height = H;
        const tctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tctx) return null;
        tctx.drawImage(sourceCanvas, 0, 0, W, H);

        let src: any, gray: any, blur: any, edges: any, dilated: any, contours: any, hierarchy: any, approx: any;
        let bestPoly: any = null;
        let bestArea = 0;
        let largestCnt: any = null;
        let largestArea = 0;

        const pointsFromApprox = (poly: any): Point[] => {
            const pts: Point[] = [];
            for (let i = 0; i < 4; i++) {
                pts.push({ x: poly.data32S[i * 2], y: poly.data32S[i * 2 + 1] });
            }
            return pts;
        };

        const sortToCorners = (pts: Point[]): Corners => {
            const sorted = [...pts].sort((a, b) => (a.x + a.y) - (b.x + b.y));
            const tl = sorted[0];
            const br = sorted[3];
            const remaining = [sorted[1], sorted[2]].sort((a, b) => (a.x - a.y) - (b.x - b.y));
            const bl = remaining[0];
            const tr = remaining[1];
            return {
                tl: { x: tl.x / W, y: tl.y / H },
                tr: { x: tr.x / W, y: tr.y / H },
                br: { x: br.x / W, y: br.y / H },
                bl: { x: bl.x / W, y: bl.y / H },
            };
        };

        try {
            src = cv.imread(tempCanvas);
            gray = new cv.Mat();
            blur = new cv.Mat();
            edges = new cv.Mat();
            dilated = new cv.Mat();
            contours = new cv.MatVector();
            hierarchy = new cv.Mat();
            approx = new cv.Mat();

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
            cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
            cv.Canny(blur, edges, 40, 130);

            let M = cv.Mat.ones(5, 5, cv.CV_8U);
            cv.dilate(edges, dilated, M, new cv.Point(-1, -1), 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            M.delete();

            cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            const minArea = W * H * 0.04;

            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);
                let area = cv.contourArea(cnt);

                if (area > largestArea) {
                    if (largestCnt) largestCnt.delete();
                    largestArea = area;
                    largestCnt = cnt.clone();
                }

                if (area > minArea) {
                    let perimeter = cv.arcLength(cnt, true);
                    // Coba beberapa tingkat toleransi, karena satu nilai epsilon
                    // sering gagal menangkap kertas yang tepinya sedikit melengkung/terhalang
                    for (const epsFactor of [0.01, 0.02, 0.03, 0.04, 0.05]) {
                        cv.approxPolyDP(cnt, approx, epsFactor * perimeter, true);
                        if (approx.rows === 4) {
                            if (area > bestArea) {
                                bestArea = area;
                                if (bestPoly) bestPoly.delete();
                                bestPoly = approx.clone();
                            }
                            break;
                        }
                    }
                }
                cnt.delete();
            }

            if (bestPoly) {
                return sortToCorners(pointsFromApprox(bestPoly));
            }

            // FALLBACK: tidak ada kontur 4-sisi yang jelas, tapi ada kontur besar
            // -> pakai kotak minimum (boleh miring) yang membungkusnya sebagai tebakan awal
            if (largestCnt && largestArea > minArea) {
                const rect = cv.minAreaRect(largestCnt);
                const angleRad = (rect.angle * Math.PI) / 180;
                const cos = Math.cos(angleRad);
                const sin = Math.sin(angleRad);
                const w2 = rect.size.width / 2;
                const h2 = rect.size.height / 2;
                const localPts = [
                    { x: -w2, y: -h2 }, { x: w2, y: -h2 },
                    { x: w2, y: h2 }, { x: -w2, y: h2 },
                ];
                const pts = localPts.map(p => ({
                    x: rect.center.x + (p.x * cos - p.y * sin),
                    y: rect.center.y + (p.x * sin + p.y * cos),
                }));
                return sortToCorners(pts);
            }

            return null;
        } catch (e) {
            console.error("Deteksi sudut gagal:", e);
            return null;
        } finally {
            if (src) src.delete();
            if (gray) gray.delete();
            if (blur) blur.delete();
            if (edges) edges.delete();
            if (dilated) dilated.delete();
            if (contours) contours.delete();
            if (hierarchy) hierarchy.delete();
            if (approx) approx.delete();
            if (bestPoly) bestPoly.delete();
            if (largestCnt) largestCnt.delete();
        }
    };

    // =========================================================================
    // 4. JEPRET FOTO -> tampilkan layar adjust dengan tebakan sudut awal
    // =========================================================================
    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setRawImageUrl(dataUrl);

        const detected = detectCorners(canvas);
        setCropCorners(detected ?? DEFAULT_CORNERS);

        stopCamera();
        setAppState('adjust');
    };

    // =========================================================================
    // 5. DRAG HANDLE DI LAYAR ADJUST
    // =========================================================================
    const handleCornerPointerDown = (corner: keyof Corners) => (e: React.PointerEvent) => {
        e.preventDefault();
        dragCornerRef.current = corner;
    };

    useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            const corner = dragCornerRef.current;
            if (!corner || !adjustContainerRef.current) return;
            const rect = adjustContainerRef.current.getBoundingClientRect();
            let fx = (e.clientX - rect.left) / rect.width;
            let fy = (e.clientY - rect.top) / rect.height;
            fx = Math.min(1, Math.max(0, fx));
            fy = Math.min(1, Math.max(0, fy));
            setCropCorners(prev => ({ ...prev, [corner]: { x: fx, y: fy } }));
        };
        const handleUp = () => { dragCornerRef.current = null; };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, []);

    // =========================================================================
    // 6. KONFIRMASI CROP -> PERSPECTIVE TRANSFORM sesuai posisi 4 titik final
    // =========================================================================
    const confirmCrop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const cv = (window as any).cv;
        const fallbackToRaw = () => {
            canvas.toBlob((blob) => {
                if (blob) {
                    setCapturedBlob(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                    setAppState('preview');
                }
            }, 'image/jpeg', 0.92);
        };

        if (!cv || !cv.Mat) {
            fallbackToRaw();
            return;
        }

        const vw = canvas.width;
        const vh = canvas.height;
        const tl = { x: cropCorners.tl.x * vw, y: cropCorners.tl.y * vh };
        const tr = { x: cropCorners.tr.x * vw, y: cropCorners.tr.y * vh };
        const br = { x: cropCorners.br.x * vw, y: cropCorners.br.y * vh };
        const bl = { x: cropCorners.bl.x * vw, y: cropCorners.bl.y * vh };

        const widthTop = dist(tl, tr);
        const widthBottom = dist(bl, br);
        const heightLeft = dist(tl, bl);
        const heightRight = dist(tr, br);

        const outW = Math.max(Math.round((widthTop + widthBottom) / 2), 1);
        const outH = Math.max(Math.round((heightLeft + heightRight) / 2), 1);

        let src: any, dst: any, srcTri: any, dstTri: any, M: any;
        try {
            src = cv.imread(canvas);
            dst = new cv.Mat();

            srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                tl.x, tl.y,
                tr.x, tr.y,
                br.x, br.y,
                bl.x, bl.y,
            ]);
            dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                0, 0,
                outW, 0,
                outW, outH,
                0, outH,
            ]);

            M = cv.getPerspectiveTransform(srcTri, dstTri);
            cv.warpPerspective(src, dst, M, new cv.Size(outW, outH), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

            const outCanvas = document.createElement('canvas');
            outCanvas.width = outW;
            outCanvas.height = outH;
            cv.imshow(outCanvas, dst);

            outCanvas.toBlob((blob) => {
                if (blob) {
                    setCapturedBlob(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                    setAppState('preview');
                }
            }, 'image/jpeg', 0.92);
        } catch (e) {
            console.error("Perspective Transform Error:", e);
            fallbackToRaw();
        } finally {
            if (src) src.delete();
            if (dst) dst.delete();
            if (srcTri) srcTri.delete();
            if (dstTri) dstTri.delete();
            if (M) M.delete();
        }
    };

    const handleExtract = async () => {
        if (!capturedBlob) return;
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', capturedBlob, 'capture.jpg');

        try {
            const response = await axios.post('/api/vision/detect-text', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setExtractedText(response.data.text);
            } else {
                setError('Tidak ada teks yang terdeteksi pada gambar ini.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Gagal terhubung ke server Google Vision.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const cornerOrder: (keyof Corners)[] = ['tl', 'tr', 'br', 'bl'];
    const polygonPointsAttr = cornerOrder
        .map(c => `${cropCorners[c].x * 100},${cropCorners[c].y * 100}`)
        .join(' ');

    return ReactDOM.createPortal(
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black flex flex-col font-['Manrope'] w-screen h-screen overflow-hidden selection:bg-blue-200"
        >
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-12 pb-6 bg-gradient-to-b from-black/60 to-transparent">
                <button className="text-white hover:text-yellow-400 transition-colors"><ZapOff className="w-6 h-6" strokeWidth={2} /></button>
                <button className="text-white"><Shield className="w-6 h-6" strokeWidth={2} /></button>
                <button onClick={() => { stopCamera(); onClose(); }} className="text-white active:scale-90 transition-transform"><X className="w-7 h-7" strokeWidth={2} /></button>
            </div>

            <div className="relative flex-1 w-full h-full bg-[#111]">
                {error ? (
                    <div className="flex items-center justify-center w-full h-full p-6 text-center text-red-400 bg-gray-900">{error}</div>
                ) : appState === 'camera' ? (
                    <video ref={videoRef} autoPlay playsInline className="object-cover w-full h-full" />
                ) : appState === 'adjust' && rawImageUrl ? (
                    // ===== LAYAR ADJUST: geser 4 titik sudut manual (ala CamScanner) =====
                    <div className="flex items-center justify-center w-full h-full p-4 bg-black">
                        <div
                            ref={adjustContainerRef}
                            className="relative select-none touch-none"
                            style={{
                                aspectRatio: `${canvasRef.current?.width || 3} / ${canvasRef.current?.height || 4}`,
                                height: '100%',
                                width: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%',
                            }}
                        >
                            <img src={rawImageUrl} alt="Hasil jepretan" className="absolute inset-0 object-fill w-full h-full pointer-events-none rounded-sm" draggable={false} />

                            <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polygon
                                    points={polygonPointsAttr}
                                    fill="rgba(250, 204, 21, 0.18)"
                                    stroke="#facc15"
                                    strokeWidth="0.6"
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            {cornerOrder.map((corner) => (
                                <div
                                    key={corner}
                                    onPointerDown={handleCornerPointerDown(corner)}
                                    className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-yellow-400 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing active:scale-110 transition-transform touch-none"
                                    style={{ left: `${cropCorners[corner].x * 100}%`, top: `${cropCorners[corner].y * 100}%` }}
                                />
                            ))}
                        </div>
                    </div>
                ) : previewUrl ? (
                    <img src={previewUrl} alt="Hasil crop" className="object-contain w-full h-full" />
                ) : null}

                <canvas ref={canvasRef} className="hidden" />

                {appState === 'camera' && !error && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                            <div className="border-r border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-b border-white"></div>
                            <div className="border-r border-white"></div>
                            <div className="border-r border-white"></div>
                            <div></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center bg-black/80 pb-10 pt-6">
                {appState === 'camera' && (
                    <>
                        <div className="flex items-center gap-2 px-4 py-1.5 mb-5 text-[13px] font-bold text-black bg-white rounded-full shadow-lg">
                            <FileText className="w-3.5 h-3.5 text-gray-800" strokeWidth={2.5} />
                            <span>Dokumen</span>
                        </div>
                        <div className="flex items-center justify-between w-full px-10">
                            <button className="flex items-center justify-center w-[46px] h-[46px] overflow-hidden bg-gray-800 border border-white/20 rounded-full active:scale-95 transition-transform">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                            </button>
                            <button onClick={captureImage} disabled={!!error} className="flex items-center justify-center w-[72px] h-[72px] rounded-full border-[3px] border-gray-300 active:scale-90 transition-transform disabled:opacity-50">
                                <div className="w-[60px] h-[60px] bg-white rounded-full"></div>
                            </button>
                            <div className="w-[46px] h-[46px]"></div>
                        </div>
                    </>
                )}

                {appState === 'adjust' && (
                    <div className="flex flex-col items-center w-full px-8 gap-3 mb-2">
                        <p className="text-xs text-gray-400">
                            {isOpenCvLoaded ? 'Geser titik kuning sampai pas dengan tepi kertas' : 'Scanner AI belum siap — atur ke-4 titik secara manual'}
                        </p>
                        <div className="flex items-center justify-center w-full gap-6">
                            <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white bg-gray-800 rounded-2xl active:scale-95 transition-transform border border-gray-700">
                                <RefreshCw className="w-4 h-4" /> Ambil Ulang
                            </button>
                            <button onClick={confirmCrop} className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-2xl active:scale-95 transition-transform shadow-[0_4px_20px_rgba(37,99,235,0.4)]">
                                <Check className="w-5 h-5" /> Gunakan Foto
                            </button>
                        </div>
                    </div>
                )}

                {appState === 'preview' && (
                    <div className="flex items-center justify-center w-full px-8 gap-6 mb-4">
                        <button onClick={startCamera} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white bg-gray-800 rounded-2xl active:scale-95 transition-transform disabled:opacity-50 border border-gray-700">
                            <RefreshCw className="w-4 h-4" /> Ulangi
                        </button>
                        <button onClick={handleExtract} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-2xl active:scale-95 transition-transform disabled:opacity-50 shadow-[0_4px_20px_rgba(37,99,235,0.4)] relative overflow-hidden">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanText className="w-5 h-5" />}
                            {isLoading ? 'Memproses...' : 'Ekstrak Teks'}
                            {isLoading && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {extractedText && (
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-white dark:bg-[#1C1A29] rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[65vh] flex flex-col">
                        <div className="w-12 h-1.5 mx-auto mb-6 bg-gray-300 rounded-full dark:bg-gray-700"></div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hasil Ekstraksi</h3>
                            <button onClick={copyToClipboard} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full dark:bg-primary/20 dark:text-primary transition-colors hover:bg-blue-100 dark:hover:bg-primary/30">
                                {isCopied ? <><Check className="w-[18px] h-[18px]"/> Disalin</> : <><Copy className="w-[18px] h-[18px]"/> Salin Teks</>}
                            </button>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto text-gray-800 bg-gray-50 border border-gray-200/60 rounded-2xl dark:bg-black/20 dark:border-white/5 dark:text-gray-200 overscroll-contain shadow-inner">
                            <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">{extractedText}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>,
        document.body
    );
}