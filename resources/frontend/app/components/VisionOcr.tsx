import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { RefreshCw, ScanText, Loader2, X, Copy, Check, FileText, Download, RotateCcw, RotateCw, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VisionOcrProps {
    onClose: () => void;
}

type Point = { x: number; y: number };
type Corners = { tl: Point; tr: Point; br: Point; bl: Point };
type Edge = 'top' | 'right' | 'bottom' | 'left';
type DragTarget = { type: 'corner'; corner: keyof Corners } | { type: 'edge'; edge: Edge };
type AppState = 'camera' | 'adjust' | 'preview';

// Posisi default 4 sudut kalau OpenCV gagal menebak bentuk kertas
const DEFAULT_CORNERS: Corners = {
    tl: { x: 0.08, y: 0.08 },
    tr: { x: 0.92, y: 0.08 },
    br: { x: 0.92, y: 0.92 },
    bl: { x: 0.08, y: 0.92 },
};

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const clampPoint = (p: Point): Point => ({
    x: Math.min(1, Math.max(0, p.x)),
    y: Math.min(1, Math.max(0, p.y)),
});

export default function VisionOcr({ onClose }: VisionOcrProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const adjustContainerRef = useRef<HTMLDivElement>(null);
    const dragTargetRef = useRef<DragTarget | null>(null);

    const [appState, setAppState] = useState<AppState>('camera');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
    const [cropCorners, setCropCorners] = useState<Corners>(DEFAULT_CORNERS);

    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // STATE BARU: Mode Scan
    const [scanMode, setScanMode] = useState<'abjad' | 'braille'>('abjad');
    
    const [extractedText, setExtractedText] = useState<string>('');
    const [brailleText, setBrailleText] = useState<string>('');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const [isOpenCvLoaded, setIsOpenCvLoaded] = useState(false);

    const edgeMidpoints = {
        top: midpoint(cropCorners.tl, cropCorners.tr),
        right: midpoint(cropCorners.tr, cropCorners.br),
        bottom: midpoint(cropCorners.bl, cropCorners.br),
        left: midpoint(cropCorners.tl, cropCorners.bl),
    };

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

    const startCamera = async () => {
        setError(null);
        setCapturedBlob(null);
        setPreviewUrl(null);
        setPdfUrl(null);
        setRawImageUrl(null);
        setExtractedText('');
        setBrailleText('');
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

    const detectCorners = (sourceCanvas: HTMLCanvasElement): Corners | null => {
        const cv = (window as any).cv;
        if (!cv || !cv.Mat) return null;

        const W = 720;
        const H = Math.max(1, Math.round((W * sourceCanvas.height) / sourceCanvas.width));
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = W;
        tempCanvas.height = H;
        const tctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tctx) return null;
        tctx.drawImage(sourceCanvas, 0, 0, W, H);

        let src: any, gray: any, enhanced: any, blur: any, edges: any, textEdges: any, threshold: any, paperMask: any, combined: any, contours: any, hierarchy: any, approx: any, kernel: any;
        let bestPoly: any = null;
        let bestRectPoints: Point[] | null = null;
        let bestScore = 0;

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
                tl: clampPoint({ x: tl.x / W, y: tl.y / H }),
                tr: clampPoint({ x: tr.x / W, y: tr.y / H }),
                br: clampPoint({ x: br.x / W, y: br.y / H }),
                bl: clampPoint({ x: bl.x / W, y: bl.y / H }),
            };
        };

        const pointsFromRotatedRect = (rect: any): Point[] => {
            const angleRad = (rect.angle * Math.PI) / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            const w2 = rect.size.width / 2;
            const h2 = rect.size.height / 2;
            return [
                { x: -w2, y: -h2 }, { x: w2, y: -h2 },
                { x: w2, y: h2 }, { x: -w2, y: h2 },
            ].map(p => ({
                x: rect.center.x + (p.x * cos - p.y * sin),
                y: rect.center.y + (p.x * sin + p.y * cos),
            }));
        };

        const updateBestCandidate = (cnt: any, scoreWeight: number) => {
            const area = cv.contourArea(cnt);
            const imageArea = W * H;
            const minArea = imageArea * 0.018;
            const maxArea = imageArea * 0.58;
            if (area < minArea || area > maxArea) return;

            const rect = cv.minAreaRect(cnt);
            const bounds = cv.boundingRect(cnt);
            const margin = Math.max(8, Math.round(Math.min(W, H) * 0.015));
            const touchesBorder =
                bounds.x <= margin ||
                bounds.y <= margin ||
                bounds.x + bounds.width >= W - margin ||
                bounds.y + bounds.height >= H - margin;

            const shortest = Math.max(1, Math.min(rect.size.width, rect.size.height));
            const longest = Math.max(rect.size.width, rect.size.height);
            const aspect = longest / shortest;
            if (aspect > 9 || aspect < 1.08) return;

            const rectangularity = area / Math.max(1, rect.size.width * rect.size.height);
            if (rectangularity < 0.42) return;

            const roiRect = new cv.Rect(
                Math.max(0, bounds.x),
                Math.max(0, bounds.y),
                Math.min(W - Math.max(0, bounds.x), bounds.width),
                Math.min(H - Math.max(0, bounds.y), bounds.height),
            );
            if (roiRect.width <= 0 || roiRect.height <= 0) return;

            const edgeRoi = textEdges.roi(roiRect);
            const internalEdgeDensity = cv.countNonZero(edgeRoi) / Math.max(1, roiRect.width * roiRect.height);
            edgeRoi.delete();
            if (internalEdgeDensity < 0.006) return;

            const centerBiasX = 1 - Math.min(0.45, Math.abs(rect.center.x / W - 0.5));
            const centerBiasY = 1 - Math.min(0.45, Math.abs(rect.center.y / H - 0.5));
            const receiptBonus = aspect >= 1.8 && aspect <= 7.2 ? 1.55 : 1;
            const documentBonus = aspect >= 1.18 && aspect <= 1.65 ? 1.12 : 1;
            const borderPenalty = touchesBorder ? 0.38 : 1;
            const veryLargePenalty = area / imageArea > 0.38 ? 0.45 : 1;
            const edgeBonus = Math.min(2.2, 0.8 + internalEdgeDensity * 18);
            const sizeScore = Math.min(area / imageArea, 0.52);
            const score = sizeScore * rectangularity * centerBiasX * centerBiasY * receiptBonus * documentBonus * edgeBonus * borderPenalty * veryLargePenalty * scoreWeight;

            if (score <= bestScore) return;

            const perimeter = cv.arcLength(cnt, true);
            let candidatePoly: any = null;
            for (const epsFactor of [0.008, 0.012, 0.016, 0.022, 0.032, 0.045, 0.06, 0.08]) {
                cv.approxPolyDP(cnt, approx, epsFactor * perimeter, true);
                if (approx.rows === 4 && cv.isContourConvex(approx)) {
                    candidatePoly = approx.clone();
                    break;
                }
            }

            bestScore = score;
            if (bestPoly) {
                bestPoly.delete();
                bestPoly = null;
            }

            if (candidatePoly) {
                bestPoly = candidatePoly;
                bestRectPoints = null;
            } else {
                bestRectPoints = pointsFromRotatedRect(rect);
            }
        };

        try {
            src = cv.imread(tempCanvas);
            gray = new cv.Mat();
            enhanced = new cv.Mat();
            blur = new cv.Mat();
            edges = new cv.Mat();
            textEdges = new cv.Mat();
            threshold = new cv.Mat();
            paperMask = new cv.Mat();
            combined = new cv.Mat();
            contours = new cv.MatVector();
            hierarchy = new cv.Mat();
            approx = new cv.Mat();

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
            cv.equalizeHist(gray, enhanced);
            cv.GaussianBlur(enhanced, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

            cv.Canny(blur, edges, 35, 150);
            cv.Canny(gray, textEdges, 45, 170);
            cv.adaptiveThreshold(blur, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 9);
            cv.threshold(blur, paperMask, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

            kernel = cv.Mat.ones(5, 5, cv.CV_8U);
            cv.morphologyEx(edges, combined, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 2);
            cv.dilate(combined, combined, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            cv.morphologyEx(paperMask, paperMask, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 2);

            for (const source of [
                { mat: paperMask, weight: 1.25 },
                { mat: combined, weight: 1 },
                { mat: threshold, weight: 0.85 },
            ]) {
                cv.findContours(source.mat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
                for (let i = 0; i < contours.size(); ++i) {
                    const cnt = contours.get(i);
                    try {
                        updateBestCandidate(cnt, source.weight);
                    } finally {
                        cnt.delete();
                    }
                }
                contours.delete();
                contours = new cv.MatVector();
            }

            if (bestPoly) {
                return sortToCorners(pointsFromApprox(bestPoly));
            }
            if (bestRectPoints) {
                return sortToCorners(bestRectPoints);
            }

            return null;
        } catch (e) {
            console.error("Deteksi sudut gagal:", e);
            return null;
        } finally {
            if (src) src.delete();
            if (gray) gray.delete();
            if (enhanced) enhanced.delete();
            if (blur) blur.delete();
            if (edges) edges.delete();
            if (textEdges) textEdges.delete();
            if (threshold) threshold.delete();
            if (paperMask) paperMask.delete();
            if (combined) combined.delete();
            if (contours) contours.delete();
            if (hierarchy) hierarchy.delete();
            if (approx) approx.delete();
            if (kernel) kernel.delete();
            if (bestPoly) bestPoly.delete();
        }
    };

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

    const handleCornerPointerDown = (corner: keyof Corners) => (e: React.PointerEvent) => {
        e.preventDefault();
        dragTargetRef.current = { type: 'corner', corner };
    };

    const handleEdgePointerDown = (edge: Edge) => (e: React.PointerEvent) => {
        e.preventDefault();
        dragTargetRef.current = { type: 'edge', edge };
    };

    useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            const target = dragTargetRef.current;
            if (!target || !adjustContainerRef.current) return;
            const rect = adjustContainerRef.current.getBoundingClientRect();
            let fx = (e.clientX - rect.left) / rect.width;
            let fy = (e.clientY - rect.top) / rect.height;
            fx = Math.min(1, Math.max(0, fx));
            fy = Math.min(1, Math.max(0, fy));
            setCropCorners(prev => {
                if (target.type === 'corner') {
                    return { ...prev, [target.corner]: { x: fx, y: fy } };
                }

                if (target.edge === 'top') return { ...prev, tl: { ...prev.tl, y: fy }, tr: { ...prev.tr, y: fy } };
                if (target.edge === 'right') return { ...prev, tr: { ...prev.tr, x: fx }, br: { ...prev.br, x: fx } };
                if (target.edge === 'bottom') return { ...prev, bl: { ...prev.bl, y: fy }, br: { ...prev.br, y: fy } };
                return { ...prev, tl: { ...prev.tl, x: fx }, bl: { ...prev.bl, x: fx } };
            });
        };
        const handleUp = () => { dragTargetRef.current = null; };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, []);

    const rotateCrop = (direction: 'left' | 'right') => {
        setCropCorners(prev => direction === 'left'
            ? { tl: prev.tr, tr: prev.br, br: prev.bl, bl: prev.tl }
            : { tl: prev.bl, tr: prev.tl, br: prev.tr, bl: prev.br }
        );
    };

    const resetCropAll = () => {
        setCropCorners({
            tl: { x: 0.02, y: 0.02 },
            tr: { x: 0.98, y: 0.02 },
            br: { x: 0.98, y: 0.98 },
            bl: { x: 0.02, y: 0.98 },
        });
    };

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

    // =========================================================================
    // 7. HANDLE EXTRACT TEXT (ABJAD / BRAILLE) - Diperbarui sesuai rute API
    // =========================================================================
    const handleExtract = async () => {
        if (!capturedBlob) return;
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', capturedBlob, 'capture.jpg'); // Backend baru mengharapkan nama parameter 'file'

        try {
            // Pilih rute Laravel berdasarkan mode yang dipilih user
            const endpoint = scanMode === 'abjad' ? '/api/scanner/ocr' : '/api/scanner/braille-ocr';
            
            const response = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.status === 'success' || response.data.text !== undefined) {
                const textResult = response.data.text || '';
                setExtractedText(textResult);

                if (!textResult) {
                    setError(`Tidak ada ${scanMode === 'abjad' ? 'teks alfabet' : 'titik braille'} yang terbaca.`);
                }

                // Terjemahkan otomatis ke Unicode Braille (titik-titik) jika berhasil ekstrak teks
                if (textResult) {
                    try {
                        const brailleRes = await axios.post('/api/braille/text-to-braille', { text: textResult });
                        setBrailleText(brailleRes.data.braille || '');
                    } catch (e) {
                        console.warn("Gagal konversi braille");
                    }
                }
            } else {
                setError('Tidak ada teks yang terdeteksi pada gambar ini.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Gagal terhubung ke AI Service.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(brailleText || extractedText);
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
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/55 to-transparent">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <FileText className="w-4 h-4" />
                    <span>Scan</span>
                </div>
                <button onClick={() => { stopCamera(); onClose(); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white active:scale-95 transition-transform">
                    <X className="w-6 h-6" strokeWidth={2} />
                </button>
            </div>

            <div className="relative flex-1 w-full h-full bg-black">
                {error ? (
                    <div className="flex items-center justify-center w-full h-full p-6 text-center text-red-400 bg-gray-900">{error}</div>
                ) : appState === 'camera' ? (
                    <video ref={videoRef} autoPlay playsInline className="object-cover w-full h-full" />
                ) : appState === 'adjust' && rawImageUrl ? (
                    <div className="flex items-center justify-center w-full h-full px-2 pt-14 pb-24 bg-black">
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

                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <mask id="crop-mask">
                                        <rect x="0" y="0" width="100" height="100" fill="white" />
                                        <polygon points={polygonPointsAttr} fill="black" />
                                    </mask>
                                </defs>
                                <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.48)" mask="url(#crop-mask)" />
                                <polygon
                                    points={polygonPointsAttr}
                                    fill="transparent"
                                    stroke="#2dd4bf"
                                    strokeWidth="0.7"
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            {cornerOrder.map((corner) => (
                                <div
                                    key={corner}
                                    onPointerDown={handleCornerPointerDown(corner)}
                                    className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white border-[3px] border-teal-400 shadow-lg cursor-grab active:cursor-grabbing active:scale-110 transition-transform touch-none"
                                    style={{ left: `${cropCorners[corner].x * 100}%`, top: `${cropCorners[corner].y * 100}%` }}
                                />
                            ))}

                            {(['top', 'right', 'bottom', 'left'] as Edge[]).map((edge) => {
                                const point = edgeMidpoints[edge];
                                const isVertical = edge === 'left' || edge === 'right';
                                return (
                                    <div
                                        key={edge}
                                        onPointerDown={handleEdgePointerDown(edge)}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-[3px] border-teal-400 shadow-lg cursor-grab active:cursor-grabbing active:scale-110 transition-transform touch-none"
                                        style={{
                                            left: `${point.x * 100}%`,
                                            top: `${point.y * 100}%`,
                                            width: isVertical ? 18 : 42,
                                            height: isVertical ? 42 : 18,
                                        }}
                                    />
                                );
                            })}
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

            <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5">
                {appState === 'camera' && (
                    <div className="flex w-full items-center justify-center">
                        <div className="flex w-full max-w-xs items-center justify-between">
                            <div className="flex h-11 min-w-24 items-center justify-center gap-2 rounded-full bg-black/45 px-3 text-xs font-semibold text-white/85 border border-white/10">
                                <FileText className="w-4 h-4" />
                                Dokumen
                            </div>
                            <button onClick={captureImage} disabled={!!error} className="flex items-center justify-center w-[72px] h-[72px] rounded-full border-[3px] border-gray-300 active:scale-90 transition-transform disabled:opacity-50">
                                <div className="w-[60px] h-[60px] bg-white rounded-full"></div>
                            </button>
                            <div className="w-24"></div>
                        </div>
                    </div>
                )}

                {appState === 'adjust' && (
                    <div className="flex w-full max-w-md items-center justify-between gap-2">
                        <button onClick={startCamera} className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white border border-white/10 active:scale-95 transition-transform">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <div className="grid flex-1 grid-cols-4 gap-2">
                            <button onClick={() => rotateCrop('left')} className="flex h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-white bg-black/55 rounded-xl active:scale-95 transition-transform border border-white/10">
                                <RotateCcw className="w-4 h-4" /> Left
                            </button>
                            <button onClick={() => rotateCrop('right')} className="flex h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-white bg-black/55 rounded-xl active:scale-95 transition-transform border border-white/10">
                                <RotateCw className="w-4 h-4" /> Right
                            </button>
                            <button onClick={resetCropAll} className="flex h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-white bg-black/55 rounded-xl active:scale-95 transition-transform border border-white/10">
                                <Maximize2 className="w-4 h-4" /> All
                            </button>
                            <button onClick={confirmCrop} className="flex h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-bold text-white bg-blue-600 rounded-xl active:scale-95 transition-transform shadow-[0_4px_20px_rgba(37,99,235,0.4)]">
                                <Check className="w-4 h-4" /> Next
                            </button>
                        </div>
                    </div>
                )}

                {appState === 'preview' && (
                    <div className="flex flex-col items-center justify-center w-full max-w-md gap-4">
                        {/* TOGGLE BUTTON */}
                        <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-2xl mb-2">
                            <button
                                onClick={() => setScanMode('abjad')}
                                className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300 ${
                                    scanMode === 'abjad' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Teks Abjad
                            </button>
                            <button
                                onClick={() => setScanMode('braille')}
                                className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300 ${
                                    scanMode === 'braille' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Titik Braille
                            </button>
                        </div>
                        {/* ACTION BUTTONS */}
                        <div className="flex items-center w-full gap-3">
                            <button onClick={startCamera} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-black/55 rounded-xl active:scale-95 transition-transform disabled:opacity-50 border border-white/10">
                                <RefreshCw className="w-4 h-4" /> Ulangi
                            </button>
                            <button onClick={handleExtract} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl active:scale-95 transition-transform disabled:opacity-50 shadow-[0_4px_20px_rgba(37,99,235,0.4)] relative overflow-hidden">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanText className="w-5 h-5" />}
                                {isLoading ? 'Memproses...' : `Scan ${scanMode === 'abjad' ? 'Abjad' : 'Braille'}`}
                                {isLoading && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {(extractedText || brailleText) && (
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-white dark:bg-[#1C1A29] rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[65vh] flex flex-col">
                        <div className="w-12 h-1.5 mx-auto mb-6 bg-gray-300 rounded-full dark:bg-gray-700"></div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hasil {scanMode === 'abjad' ? 'Abjad' : 'Braille'}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full dark:bg-primary/20 dark:text-primary transition-colors hover:bg-blue-100 dark:hover:bg-primary/30">
                                    {isCopied ? <><Check className="w-[18px] h-[18px]" /> Disalin</> : <><Copy className="w-[18px] h-[18px]" /> Salin</>}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain">
                            <div className="p-5 text-gray-800 bg-gray-50 border border-gray-200/60 rounded-2xl dark:bg-black/20 dark:border-white/5 dark:text-gray-200 shadow-inner">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Teks terbaca</p>
                                <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">{extractedText || 'Tidak ada teks yang terbaca.'}</p>
                            </div>
                            <div className="p-5 text-gray-900 bg-yellow-50 border border-yellow-200/70 rounded-2xl dark:bg-yellow-500/10 dark:border-yellow-400/20 dark:text-yellow-50 shadow-inner">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-yellow-700 dark:text-yellow-300">Braille</p>
                                <p className="whitespace-pre-wrap leading-relaxed text-2xl font-medium">{brailleText || 'Belum ada hasil braille.'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>,
        document.body
    );
}