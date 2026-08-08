import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useRef, useCallback, useEffect } from 'react';
import { MobileLayout } from '../components/MobileLayout';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ChevronDown, Tag, Send, Calculator, Plus, X, Image, Film, Code, Terminal, Minus, Quote, Bold, Italic, Underline, Strikethrough, Highlighter, Link as LinkIcon, Heading1, Heading2, Loader2, Clock, FileText, Trash2 } from 'lucide-react';
import { mataPelajaran } from '../data/mockData';
import ReactQuill, { Quill } from 'react-quill';
// @ts-ignore
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import { useToast } from '../contexts/ToastContext';

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err: any) => reject(err));
    if (imageSrc.startsWith('http')) {
      img.setAttribute('crossOrigin', 'anonymous');
    }
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 1200;
  
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;
  
  if (targetWidth > MAX_WIDTH || targetHeight > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / targetWidth, MAX_HEIGHT / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

async function getFullViewImg(imageSrc: string): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err: any) => reject(err));
    if (imageSrc.startsWith('http')) {
      img.setAttribute('crossOrigin', 'anonymous');
    }
    img.src = imageSrc;
  });

  const CANVAS_W = 1200;
  const CANVAS_H = 675; // 16:9

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // --- Step 1: Draw blurred background (cover-fill) ---
  const imgRatio = image.width / image.height;
  const canvasRatio = CANVAS_W / CANVAS_H;
  let sx = 0, sy = 0, sw = image.width, sh = image.height;
  if (imgRatio > canvasRatio) {
    // Image is wider → crop sides
    sw = image.height * canvasRatio;
    sx = (image.width - sw) / 2;
  } else {
    // Image is taller → crop top/bottom
    sh = image.width / canvasRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.filter = 'blur(30px) brightness(0.5)';
  // Draw slightly larger to avoid blur edge artifacts
  ctx.drawImage(image, sx, sy, sw, sh, -40, -40, CANVAS_W + 80, CANVAS_H + 80);
  ctx.filter = 'none';

  // --- Step 2: Draw original image centered (contain-fit) ---
  let drawW, drawH;
  if (imgRatio > canvasRatio) {
    // Image is wider → fit to width
    drawW = CANVAS_W;
    drawH = CANVAS_W / imgRatio;
  } else {
    // Image is taller → fit to height
    drawH = CANVAS_H;
    drawW = CANVAS_H * imgRatio;
  }
  const drawX = (CANVAS_W - drawW) / 2;
  const drawY = (CANVAS_H - drawH) / 2;

  ctx.drawImage(image, drawX, drawY, drawW, drawH);

  return canvas.toDataURL('image/jpeg', 0.85);
}

import { registerQuillExtensions } from '../components/editor/editor.config';
import { HIGHLIGHT_COLORS, jenjangOptions } from '../components/editor/editor.constants';
import { FloatingBlockToolbar } from '../components/editor/FloatingBlockToolbar';
import { SideToolbar } from '../components/editor/SideToolbar';
import { FormulaModal } from '../components/editor/FormulaModal';
import { AltTextModal } from '../components/editor/AltTextModal';
import { PublishPreviewModal } from '../components/editor/PublishPreviewModal';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';



// Register Quill extensions (Blots, Image handling, etc.)
registerQuillExtensions(Quill);


// DELETED FloatingToolbar



// ========== MAIN UPLOAD PAGE ==========
export default function UploadPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.write_note'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDraftId = searchParams.get('id');
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const { showToast } = useToast();

  const { resolvedLanguage } = useLanguage();
  
  const quillRef = useRef<ReactQuill>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const [extractedThumbnail, setExtractedThumbnail] = useState<string | null>(null);
  const [finalThumbnail, setFinalThumbnail] = useState<string | null>(null);
  const [thumbnailFit, setThumbnailFit] = useState<'cover' | 'contain'>('cover');
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [previewDescription, setPreviewDescription] = useState('');
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [altModalParams, setAltModalParams] = useState<{ index: number; text: string } | null>(null);
  const [isGeneratingFullView, setIsGeneratingFullView] = useState(false);
  const [isFullViewMode, setIsFullViewMode] = useState(false);

  const [meta, setMeta] = useState({
    mataPelajaran: '',
    jenjang: 'SMA',
    kelas: '10' as string | number,
    semester: 1,
    tags: [] as string[],
    ajukanPakar: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [mapelSearch, setMapelSearch] = useState('');
  const [isMapelDropdownOpen, setIsMapelDropdownOpen] = useState(false);
  const mapelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draftId) {
      const fetchDraft = async () => {
        setIsLoadingDraft(true);
        try {
          const res = await axios.get(`/api/v1/posts/${draftId}`);
          const data = res.data.data;
          setTitle(data.title || '');
          setContent(data.content || '');
          setMeta({
            mataPelajaran: data.mapel || '',
            jenjang: data.jenjang || 'SMA',
            kelas: data.kelas || '10',
            semester: data.semester || 1,
            tags: data.tags || [],
            ajukanPakar: false,
          });
          if (data.thumbnail) {
            setExtractedThumbnail(data.thumbnail);
            setFinalThumbnail(data.thumbnail);
            setThumbnailFit(data.thumbnail_fit || 'cover');
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
          showToast(t('upload.error_load_draft'), 'error');
        } finally {
          setIsLoadingDraft(false);
        }
      };
      fetchDraft();
    }
  }, [draftId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mapelDropdownRef.current && !mapelDropdownRef.current.contains(event.target as Node)) {
        setIsMapelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMapel = mataPelajaran.filter(m => m.name.toLowerCase().includes(mapelSearch.toLowerCase()));

  const modules = {
    toolbar: false as const,
    formula: true,
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'background',
    'list', 'bullet', 'link', 'image', 'video', 'formula',
    'blockquote', 'code-block', 'divider', 'layout', 'alt', 'align', 'code'
  ];

  const currentJenjang = jenjangOptions.find(j => j.id === meta.jenjang);
  const kelasOptions = currentJenjang?.kelas || [];
  const maxSemester = currentJenjang?.maxSemester || 2;
  const kelasLabel = currentJenjang?.kelasLabel || 'Kelas';

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !meta.tags.includes(tag)) {
      setMeta({ ...meta, tags: [...meta.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMeta({ ...meta, tags: meta.tags.filter(t => t !== tag) });
  };

  const insertFormula = useCallback((latex: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'formula', latex, 'user');
      quill.setSelection(range.index + 1, 0);
    }
    setShowFormulaModal(false);
  }, []);

  const hasContent = content.replace(/<[^>]*>/g, '').trim().length > 0;
  // We allow clicking the first publish to open modal regardless of metadata
  const canOpenPreview = !!(title.trim() && hasContent);
  const canPublishFinal = !!(title.trim() && hasContent && meta.mataPelajaran);

  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
    const newThumb = availableImages[index];
    setExtractedThumbnail(newThumb);
    setFinalThumbnail(newThumb);
    setThumbnailFit('cover');
    setIsFullViewMode(false);
    setIsCropping(false);
  };

  const handleOpenPreview = () => {
    if (!canOpenPreview) return;
    
    const urls: string[] = [];
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      urls.push(match[1]);
    }
    
    setAvailableImages(urls);
    
    if (urls.length > 0) {
        if (!extractedThumbnail || !urls.includes(extractedThumbnail)) {
            setExtractedThumbnail(urls[0]);
            setFinalThumbnail(urls[0]);
            setSelectedImageIndex(0);
            setThumbnailFit('cover');
        } else {
            setSelectedImageIndex(urls.indexOf(extractedThumbnail));
        }
    } else {
        setExtractedThumbnail(null);
        if(!finalThumbnail) setFinalThumbnail(null);
    }
    
    setIsCropping(false);
    if (!descriptionEdited) {
      const withLineBreaks = content.replace(/<\/(p|div|h[1-6])>/gi, '\n').replace(/<br\s*\/?>/gi, '\n');
      const strippedContent = withLineBreaks.replace(/<[^>]*>?/gm, '').trim();
      setPreviewDescription(strippedContent.length > 150 ? strippedContent.substring(0, 150) + '...' : strippedContent);
    }
    setShowPreviewModal(true);
  };

  const handleApplyCrop = async () => {
    if (extractedThumbnail && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(extractedThumbnail, croppedAreaPixels);
        setFinalThumbnail(croppedImage);
        setThumbnailFit('cover');
        setIsFullViewMode(false);
        setIsCropping(false);
      } catch (e) {
        console.error('Failed to crop image', e);
        showToast(t('upload.error_crop'), 'error');
      }
    }
  };

  const handleFullView = async () => {
    if (!extractedThumbnail) return;
    setIsGeneratingFullView(true);
    try {
      const fullViewImage = await getFullViewImg(extractedThumbnail);
      setFinalThumbnail(fullViewImage);
      setThumbnailFit('cover');
      setIsFullViewMode(true);
    } catch (e) {
      console.error('Failed to generate full view', e);
      showToast(t('upload.error_crop'), 'error');
    } finally {
      setIsGeneratingFullView(false);
    }
  };

  const handleSubmit = async () => {
    if (!canPublishFinal) return;
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        content: content,
        description: previewDescription,
        thumbnail: finalThumbnail || extractedThumbnail,
        thumbnail_fit: thumbnailFit,
        mapel: meta.mataPelajaran,
        jenjang: meta.jenjang,
        kelas: meta.kelas.toString(),
        semester: meta.semester.toString(),
        tags: meta.tags,
        visibility: 'public'
      };

      if (draftId) {
        await axios.put(`/api/v1/posts/${draftId}`, payload);
        if (meta.ajukanPakar) {
          try { await axios.post(`/api/v1/posts/${draftId}/ajukan`); } catch (e) { /* silent */ }
        }
      } else {
        const res = await axios.post('/api/v1/posts', payload);
        const newPostId = res.data.data._id || res.data.data.id;
        if (meta.ajukanPakar && newPostId) {
          try { await axios.post(`/api/v1/posts/${newPostId}/ajukan`); } catch (e) { /* silent */ }
        }
      }
      showToast(meta.ajukanPakar ? (t('upload.success_publish_expert') || 'Catatan berhasil dipublikasikan dan diajukan ke pakar') : (t('upload.success_publish') || 'Catatan berhasil dipublikasikan'), 'success');
      navigate(-1);
    } catch (error) {
      console.error('Gagal mempublikasikan catatan:', error);
      showToast(t('upload.error_save') || 'Gagal menyimpan catatan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      showToast(t('upload.draft_title_required') || 'Judul diperlukan untuk menyimpan draf', 'warning');
      return;
    }
    setIsSavingDraft(true);

    try {
      const payload = {
        title: title.trim(),
        content: content,
        description: previewDescription,
        thumbnail: finalThumbnail || extractedThumbnail,
        thumbnail_fit: thumbnailFit,
        mapel: meta.mataPelajaran,
        jenjang: meta.jenjang,
        kelas: meta.kelas.toString(),
        semester: meta.semester.toString(),
        tags: meta.tags,
        visibility: 'draft'
      };

      if (draftId) {
        await axios.put(`/api/v1/posts/${draftId}`, payload);
        showToast(t('upload.draft_updated') || 'Draf berhasil diperbarui', 'success');
      } else {
        const res = await axios.post('/api/v1/posts', payload);
        const newDraftId = res.data.data._id || res.data.data.id;
        setDraftId(newDraftId);
        showToast(t('upload.draft_saved') || 'Draf berhasil disimpan', 'success');
      }
      setShowPreviewModal(false);
      navigate('/home');
    } catch (error) {
      console.error('Gagal menyimpan draf:', error);
      showToast(t('upload.draft_error') || 'Gagal menyimpan draf', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <MobileLayout showBottomNav={false} hideMobileTopNav={true}>
      {isLoadingDraft && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center animate-bounce">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          </div>
          <h3 className="mt-6 font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 text-lg">
            {t('upload.preparing_draft') || 'Menyiapkan draf...'}
          </h3>
          <p className="mt-2 font-['Manrope'] text-gray-700 font-medium text-sm">
            {t('upload.wait_draft') || 'Mohon tunggu sebentar...'}
          </p>
        </div>
      )}
      <div className="min-h-screen bg-white dark:bg-[#13111C]">

        {/* ─── Sticky Header: Top Bar + Formatting Toolbar ─── */}
        <div className="sticky top-0 z-30">
          {/* Top Bar */}
          <div className="bg-white/95 dark:bg-[#13111C]/95 backdrop-blur-md border-b border-gray-100/60 dark:border-white/5 transition-all duration-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/15 rounded-full transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <div className="hidden sm:flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.4)] animate-pulse"></div>
                  <span className="text-[14px] font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                    {title.trim() ? title : t('upload.new_draft')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleOpenPreview}
                  disabled={!canOpenPreview}
                  className="flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-full text-[13px] font-['Lexend_Deca'] font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-all duration-200"
                >
                  {t('upload.publish')}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Formatting Toolbar ─── */}
          <SideToolbar quillRef={quillRef} onFormulaClick={() => setShowFormulaModal(true)} />
        </div>

        <PublishPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={title}
          setTitle={setTitle}
          content={content}
          previewDescription={previewDescription}
          setPreviewDescription={setPreviewDescription}
          descriptionEdited={descriptionEdited}
          setDescriptionEdited={setDescriptionEdited}
          isCropping={isCropping}
          setIsCropping={setIsCropping}
          crop={crop}
          setCrop={setCrop}
          zoom={zoom}
          setZoom={setZoom}
          setCroppedAreaPixels={setCroppedAreaPixels}
          handleApplyCrop={handleApplyCrop}
          finalThumbnail={finalThumbnail}
          extractedThumbnail={extractedThumbnail}
          setFinalThumbnail={setFinalThumbnail}
          thumbnailFit={thumbnailFit}
          setThumbnailFit={setThumbnailFit}
          availableImages={availableImages}
          selectedImageIndex={selectedImageIndex}
          handleSelectImage={handleSelectImage}
          meta={meta}
          setMeta={setMeta}
          tagInput={tagInput}
          setTagInput={setTagInput}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          mapelSearch={mapelSearch}
          setMapelSearch={setMapelSearch}
          isMapelDropdownOpen={isMapelDropdownOpen}
          setIsMapelDropdownOpen={setIsMapelDropdownOpen}
          filteredMapel={filteredMapel}
          handleSubmit={handleSubmit}
          handleSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
          isSavingDraft={isSavingDraft}
          canPublishFinal={canPublishFinal}
          mapelDropdownRef={mapelDropdownRef}
          onFullView={handleFullView}
          isGeneratingFullView={isGeneratingFullView}
          isFullViewMode={isFullViewMode}
        />


        {/* Writing Area */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative">

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('upload.title_placeholder')}
            className="w-full text-[40px] md:text-[48px] font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none mt-12 mb-2 leading-[1.1] tracking-[-0.03em] transition-all bg-transparent"
            maxLength={200}
          />
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(title.length / 200) * 100}%` }}></div>
            </div>
            <p className="text-[11px] font-['Lexend_Deca'] font-extrabold text-gray-600 uppercase tracking-widest">({title.length}/200 {t('upload.characters')})</p>
          </div>

          {/* Editor */}
          <div className="notion-editor pb-32" dir={/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/.test(content) ? 'rtl' : 'ltr'}>
            <style dangerouslySetInnerHTML={{ __html: `
              .notion-editor .ql-container.ql-snow { border: none !important; font-family: 'Manrope', sans-serif; font-size: 17px; }
              .notion-editor .ql-editor { padding: 0 !important; min-height: 500px; line-height: 1.9; color: #1f2937; }
              .dark .notion-editor .ql-editor { color: #E8E6F0; }
              .notion-editor .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; font-family: 'Manrope', sans-serif; left: 0 !important; right: 0 !important; }
              .dark .notion-editor .ql-editor.ql-blank::before { color: #4b5563; }
              .notion-editor .ql-editor h1 { font-family: 'Lexend Deca', sans-serif; font-size: 1.75em; font-weight: 700; margin: 1em 0 0.4em; color: #111827; }
              .notion-editor .ql-editor h2 { font-family: 'Lexend Deca', sans-serif; font-size: 1.35em; font-weight: 700; margin: 0.8em 0 0.3em; color: #1f2937; }
              .notion-editor .ql-editor h3 { font-family: 'Lexend Deca', sans-serif; font-size: 1.15em; font-weight: 600; margin: 0.6em 0 0.3em; color: #374151; }
              .notion-editor .ql-editor p { margin-bottom: 0.5em; position: relative; }
              .notion-editor .ql-editor img, .notion-editor .ql-editor .ql-video { 
                  border-radius: 12px; 
                  display: block !important; 
                  margin-left: auto !important; 
                  margin-right: auto !important; 
                  margin-top: 2em !important; 
                  margin-bottom: 0.5em !important; 
                  cursor: pointer; 
                  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              }
              /* Layout Modifications */
              .notion-editor .ql-editor img[data-layout="inline"] {
                  max-width: 70%;
              }
              .notion-editor .ql-editor img[data-layout="wide"] {
                  max-width: 100%;
                  width: 100%;
              }
              .notion-editor .ql-editor img[data-layout="fullBleed"] {
                  max-width: none;
                  width: 100vw !important;
                  margin-left: 50% !important;
                  transform: translateX(-50%);
                  border-radius: 0;
                  height: auto;
                  object-fit: contain;
                  max-height: 85vh;
              }
              .notion-editor .ql-editor ul, .notion-editor .ql-editor ol { padding-left: 1.5em; }
              .notion-editor .ql-editor li { margin-bottom: 0.3em; }
              .notion-editor .ql-editor ol.ql-alpha-list > li::before { content: counter(list-0, lower-alpha) ". " !important; }
              .notion-editor .ql-editor .ql-formula { padding: 3px 8px; background: #faf5ff; border-radius: 6px; border: 1px solid #e9d5ff; color: #7c3aed; }
              .notion-editor .ql-editor hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
              .notion-editor .ql-editor blockquote { border-left: 4px solid #4f46e5; margin: 1.2em 0; padding: 0.8em 1.2em; color: #4b5563; background: #f8fafc; border-radius: 0 12px 12px 0; font-style: italic; font-size: 1.05em; }
              .notion-editor .ql-editor pre.ql-syntax { background: #1e1e2e !important; color: #cdd6f4 !important; border-radius: 12px; padding: 20px 24px; margin: 1.2em 0; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 14px; line-height: 1.7; overflow-x: auto; border: 1px solid #313244; }
              .notion-editor .ql-editor .ql-video { border-radius: 12px; margin: 1.5em 0; width: 100%; aspect-ratio: 16/9; }
              .notion-editor .ql-editor code { background: #f1f5f9; color: #e11d48; padding: 0.2em 0.4em; border-radius: 6px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.9em; font-weight: 600; }
              .notion-editor .ql-editor a { color: #4f46e5; text-decoration: underline; text-decoration-color: rgba(79,70,229,0.3); text-underline-offset: 2px; transition: all 0.2s; cursor: pointer; }
              .notion-editor .ql-editor a:hover { text-decoration-color: #4f46e5; }
              .notion-editor .ql-snow .ql-tooltip { border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 8px 24px rgba(0,0,0,0.12); padding: 10px 16px; z-index: 9999 !important; background: white; font-family: 'Manrope', sans-serif; font-size: 13px; }
              .notion-editor .ql-snow .ql-tooltip a.ql-preview { color: #4f46e5; font-weight: 600; text-decoration: underline; max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom; }
              .notion-editor .ql-snow .ql-tooltip a.ql-action::after { content: 'Edit'; border-right: 1px solid #e5e7eb; padding-right: 8px; margin-left: 8px; color: #6366f1; font-weight: 600; }
              .notion-editor .ql-snow .ql-tooltip a.ql-remove::before { content: 'Hapus'; margin-left: 8px; color: #ef4444; font-weight: 600; }
              .notion-editor .ql-snow .ql-tooltip input[type=text] { border-radius: 8px; border: 1px solid #d1d5db; padding: 6px 10px; font-family: 'Manrope', sans-serif; font-size: 13px; }
              /* RTL Overrides for Editor */
              .notion-editor[dir="rtl"] .ql-editor { text-align: right; }
              .notion-editor[dir="rtl"] .ql-editor p, 
              .notion-editor[dir="rtl"] .ql-editor h1, 
              .notion-editor[dir="rtl"] .ql-editor h2, 
              .notion-editor[dir="rtl"] .ql-editor h3 { text-align: right; }
              .notion-editor[dir="rtl"] .ql-editor ul, 
              .notion-editor[dir="rtl"] .ql-editor ol { padding-left: 0 !important; padding-right: 1.5em !important; }
              .notion-editor[dir="rtl"] .ql-editor li::before { margin-left: 0.3em !important; margin-right: -1.5em !important; text-align: left !important; }
              .notion-editor[dir="rtl"] .ql-editor blockquote { border-left: none !important; border-right: 4px solid #4f46e5 !important; border-radius: 12px 0 0 12px !important; }
              
              /* Always LTR for Code Blocks */
              pre.ql-syntax, code { direction: ltr !important; text-align: left !important; }
              .notion-editor[dir="rtl"] pre.ql-syntax { text-align: left !important; }
            `}} />
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder={t('upload.write_placeholder')}
            />
          </div>

          {/* Floating Block Toolbar (Image controls + Delete action) */}
          <FloatingBlockToolbar quillRef={quillRef} onEditAlt={(index, text) => setAltModalParams({ index, text })} />
        </div>

        <FormulaModal
          isOpen={showFormulaModal}
          onClose={() => setShowFormulaModal(false)}
          onInsertFormula={insertFormula}
        />


        <AltTextModal
          isOpen={!!altModalParams}
          initialText={altModalParams?.text || ''}
          onClose={() => setAltModalParams(null)}
          onSave={(text) => {
            const quill = quillRef.current?.getEditor();
            if (quill && altModalParams) quill.formatText(altModalParams.index, 1, 'alt', text);
            setAltModalParams(null);
          }}
        />


        {/* Bottom hint — sticky so it respects sidebar layout */}
        {!canOpenPreview && (
          <div className="sticky bottom-0 bg-white/90 dark:bg-[#13111C]/90 backdrop-blur-md border-t border-gray-100 dark:border-white/5 py-3 z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm font-['Manrope'] text-gray-600 font-bold text-center px-4">
              {!title.trim() ? t('upload.hint_title') : !hasContent ? t('upload.hint_content') : ''}
            </p>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}