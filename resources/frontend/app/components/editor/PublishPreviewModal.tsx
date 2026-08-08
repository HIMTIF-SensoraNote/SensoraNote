import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Trash2, Crop, Maximize, Check, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { jenjangOptions } from './editor.constants';
import { useTranslation } from '../../hooks/useTranslation';
import { formatClassOption, formatSemesterOption } from '../../utils/formatEducationLevel';
import { mataPelajaran } from '../../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface PublishPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (val: string) => void;
  content: string;
  previewDescription: string;
  setPreviewDescription: (val: string) => void;
  descriptionEdited: boolean;
  setDescriptionEdited: (val: boolean) => void;
  isCropping: boolean;
  setIsCropping: (val: boolean) => void;
  crop: { x: number; y: number };
  setCrop: (val: { x: number; y: number }) => void;
  zoom: number;
  setZoom: (val: number) => void;
  setCroppedAreaPixels: (val: any) => void;
  handleApplyCrop: () => void;
  finalThumbnail: string | null;
  extractedThumbnail: string | null;
  setFinalThumbnail: (val: string | null) => void;
  thumbnailFit: 'cover' | 'contain';
  setThumbnailFit: (val: 'cover' | 'contain') => void;
  availableImages: string[];
  selectedImageIndex: number;
  handleSelectImage: (index: number) => void;
  meta: any;
  setMeta: (val: any) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  mapelSearch: string;
  setMapelSearch: (val: string) => void;
  isMapelDropdownOpen: boolean;
  setIsMapelDropdownOpen: (val: boolean) => void;
  filteredMapel: any[];
  handleSubmit: () => void;
  handleSaveDraft: () => void;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  canPublishFinal: boolean;
  mapelDropdownRef: React.RefObject<HTMLDivElement>;
  onFullView: () => void;
  isGeneratingFullView: boolean;
  isFullViewMode: boolean;
}

export function PublishPreviewModal(props: PublishPreviewModalProps) {
  const {
    isOpen, onClose, title, setTitle, previewDescription, setPreviewDescription,
    setDescriptionEdited, isCropping, setIsCropping, crop, setCrop, zoom, setZoom,
    setCroppedAreaPixels, handleApplyCrop, finalThumbnail, extractedThumbnail,
    setFinalThumbnail, thumbnailFit, setThumbnailFit, availableImages,
    selectedImageIndex, handleSelectImage, meta, setMeta, tagInput, setTagInput,
    handleAddTag, handleRemoveTag, mapelSearch, setMapelSearch, isMapelDropdownOpen,
    setIsMapelDropdownOpen, filteredMapel, handleSubmit, handleSaveDraft,
    isSubmitting, isSavingDraft, canPublishFinal, mapelDropdownRef,
    onFullView, isGeneratingFullView, isFullViewMode
  } = props;

  const [isKelasDropdownOpen, setIsKelasDropdownOpen] = useState(false);
  const [isSemesterDropdownOpen, setIsSemesterDropdownOpen] = useState(false);
  const kelasDropdownRef = useRef<HTMLDivElement>(null);
  const semesterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (kelasDropdownRef.current && !kelasDropdownRef.current.contains(e.target as Node)) {
        setIsKelasDropdownOpen(false);
      }
      if (semesterDropdownRef.current && !semesterDropdownRef.current.contains(e.target as Node)) {
        setIsSemesterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const { t, language } = useTranslation();

  if (!isOpen) return null;

  const currentJenjang = jenjangOptions.find(j => j.id === meta.jenjang);
  const kelasOptions = currentJenjang?.kelas || [];
  const maxSemester = currentJenjang?.maxSemester || 2;

  return createPortal(
    <div className="fixed inset-0 bg-white dark:bg-[#13111C] z-[9999] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8 pb-32 min-h-screen flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-['Lexend_Deca'] font-extrabold text-2xl md:text-3xl text-gray-900 dark:text-gray-100 tracking-tight">{t('upload.preview_title')}</h1>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8" strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Side: Thumbnail Preview */}
          <div className="flex-1 max-w-xl">
            <div className={`w-full aspect-video bg-gray-50 dark:bg-[#1C1A29] rounded-2xl mb-4 flex flex-col items-center justify-center text-center p-8 border border-gray-200/50 dark:border-white/5 relative overflow-hidden group ${isCropping ? 'ring-4 ring-primary' : ''}`}>
              {isCropping && extractedThumbnail ? (
                <div className="absolute inset-0 z-20 bg-black">
                  <Cropper
                    image={extractedThumbnail}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    onCropChange={setCrop}
                    onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                    onZoomChange={setZoom}
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-30 flex justify-between pointer-events-none">
                     <button onClick={() => setIsCropping(false)} className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 border border-white/10 transition-all shadow-xl" title={t('upload.cancel')}>
                         <X className="w-6 h-6" strokeWidth={2.5} />
                     </button>
                     <button onClick={handleApplyCrop} className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full shadow-xl hover:bg-primary/90 transition-all border border-primary/50" title={t('upload.apply')}>
                         <Check className="w-6 h-6" strokeWidth={2.5} />
                     </button>
                  </div>
                </div>
              ) : finalThumbnail || extractedThumbnail ? (
                <img src={finalThumbnail || extractedThumbnail!} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <h4 className="font-['Manrope'] font-bold text-gray-600 mb-2">{t('upload.no_image_title')}</h4>
                  <p className="text-xs text-gray-500 font-['Manrope'] font-medium">{t('upload.no_image_desc')}</p>
                </>
              )}

              {!isCropping && extractedThumbnail && (
                <div className="absolute top-3 right-3 z-10">
                   <div className="bg-white/95 dark:bg-[#1C1A29]/95 backdrop-blur-md rounded-full shadow-md border border-gray-200/80 dark:border-white/10 p-1.5 flex gap-1.5">
                      <button onClick={onFullView} disabled={isGeneratingFullView} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isFullViewMode ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'} ${isGeneratingFullView ? 'opacity-50 cursor-wait' : ''}`} title={t('upload.full_view')}>
                          {isGeneratingFullView ? <Loader2 className="w-4 h-4 animate-spin" /> : <Maximize className="w-4 h-4" strokeWidth={2.5} />}
                      </button>
                      <button onClick={() => setIsCropping(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#252336] text-gray-950 dark:text-gray-100 border border-gray-200 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all" title={t('upload.crop_photo')}>
                          <Crop className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                   </div>
                </div>
              )}
            </div>

            {/* Thumbnail Selector Carousel */}
            {!isCropping && availableImages.length > 1 && (
              <div className="mb-4 animate-in fade-in zoom-in-95 duration-300">
                <p className="text-[13px] font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 mb-2.5">{t('upload.choose_cover')}</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   {availableImages.map((img, idx) => (
                       <button 
                         key={idx}
                         onClick={() => handleSelectImage(idx)}
                         className={`w-[88px] h-[52px] shrink-0 rounded-[10px] overflow-hidden border-2 transition-all duration-200 cursor-pointer ${selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/30 scale-[1.02] shadow-sm' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]'}`}
                         title={`Gambar ${idx+1}`}
                       >
                          <img src={img} alt={`Pilihan Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                       </button>
                   ))}
                </div>
              </div>
            )}

            <div className="space-y-4 font-['Manrope'] text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/5 pb-6 group">
              <div className="relative">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('upload.title_placeholder_preview')}
                  className="w-full font-['Lexend_Deca'] text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 border-b border-transparent hover:border-gray-300 dark:hover:border-white/10 focus:border-primary focus:outline-none bg-transparent transition-colors py-1"
                />
                <textarea 
                  value={previewDescription}
                  onChange={(e) => {
                     setPreviewDescription(e.target.value);
                     setDescriptionEdited(true);
                  }}
                  placeholder={t('upload.desc_placeholder')}
                  className="w-full text-sm leading-relaxed border-b border-transparent hover:border-gray-300 dark:hover:border-white/10 focus:border-primary focus:outline-none bg-transparent transition-colors resize-none overflow-hidden min-h-[60px] text-gray-700 dark:text-gray-300 placeholder:text-gray-500 font-bold"
                  rows={3}
                />
              </div>
            </div>
            <p className="text-[13px] text-gray-500 font-['Manrope'] font-bold mt-4">
              {t('upload.meta_note')}
            </p>
          </div>

          {/* Right Side: Meta Inputs */}
          <div className="w-full lg:w-[400px] shrink-0">
            
            {/* Mapel Row */}
            <div className="mb-8" ref={mapelDropdownRef}>
               <p className="font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 text-[15px] mb-2">{t('upload.category_title')} <span className="text-red-500">*</span></p>
               <p className="text-[13px] text-gray-600 font-['Manrope'] mb-3 font-bold">{t('upload.category_desc')}</p>
               
               <div className="relative">
                  <div 
                     className={`flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-[#1C1A29] border ${isMapelDropdownOpen ? 'border-primary/50 bg-white dark:bg-[#252336]' : 'border-transparent hover:border-gray-200 dark:hover:border-white/10'} rounded-lg transition-all cursor-pointer`}
                     onClick={() => setIsMapelDropdownOpen(true)}
                  >
                     <input
                        type="text"
                        value={isMapelDropdownOpen ? mapelSearch : (() => {
                           if (!meta.mataPelajaran) return '';
                           const mapel = mataPelajaran.find(m => m.name === meta.mataPelajaran);
                           if (mapel) {
                              const translated = t(`subjects.${mapel.id}`);
                              return translated !== `subjects.${mapel.id}` ? translated : mapel.name;
                           }
                           return meta.mataPelajaran;
                        })()}
                        onChange={(e) => {
                           setMapelSearch(e.target.value);
                           setIsMapelDropdownOpen(true);
                        }}
                        placeholder={t('upload.search_category')}
                        className="w-full bg-transparent border-none outline-none text-[14px] font-['Manrope'] text-gray-950 dark:text-gray-100 placeholder:text-gray-500 font-bold"
                     />
                     <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isMapelDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                  </div>

                  <AnimatePresence>
                  {isMapelDropdownOpen && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-10 w-full mt-2 bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 rounded-xl shadow-lg dark:shadow-2xl max-h-60 overflow-y-auto no-scrollbar origin-top"
                     >
                        {filteredMapel.length > 0 ? (
                           (Object.entries(filteredMapel.reduce((acc, current) => {
                               const category = current.category || 'Lainnya';
                               if (!acc[category]) { acc[category] = []; }
                               acc[category].push(current);
                               return acc;
                           }, {} as Record<string, any[]>)) as [string, any[]][]).map(([category, items]) => (
                              <div key={category} className="pb-1 last:pb-0">
                                 <div className="sticky top-0 bg-white/95 dark:bg-[#1C1A29]/95 backdrop-blur-sm px-4 py-2 text-[11px] font-['Lexend_Deca'] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider z-10 border-b border-gray-100 dark:border-white/5">
                                    {t(`subject_categories.${category}`) !== `subject_categories.${category}` ? t(`subject_categories.${category}`) : category}
                                 </div>
                                 <div className="py-1">
                                    {items.map((m: any) => (
                                       <div
                                          key={m.id}
                                          onClick={() => {
                                             setMeta({ ...meta, mataPelajaran: m.name });
                                             setMapelSearch('');
                                             setIsMapelDropdownOpen(false);
                                          }}
                                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${meta.mataPelajaran === m.name ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                       >
                                          <span className="text-lg">{m.icon}</span>
                                          <span className={`text-[14px] font-['Manrope'] ${meta.mataPelajaran === m.name ? 'font-bold text-primary' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                             {t(`subjects.${m.id}`) !== `subjects.${m.id}` ? t(`subjects.${m.id}`) : m.name}
                                          </span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="px-4 py-4 text-center">
                              <p className="text-[13px] text-gray-600 font-['Manrope'] font-bold">{t('upload.no_category')}</p>
                              <p className="text-[12px] text-gray-500 font-['Manrope'] mt-1 font-medium">{t('upload.no_category_desc')}</p>
                           </div>
                        )}
                     </motion.div>
                  )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Pendidikan & Kelas Row */}
            <div className="mb-8">
               <p className="font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 text-[15px] mb-2">{t('upload.edu_level')}</p>
               <p className="text-[13px] text-gray-600 font-['Manrope'] mb-3 font-bold">{t('upload.edu_level_desc')}</p>
               
               <div className="flex gap-2 flex-wrap mb-3">
                {jenjangOptions.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => setMeta({ ...meta, jenjang: j.id, kelas: j.kelas[0], semester: 1 })}
                    className={`px-3 py-1 rounded-full text-[12px] font-['Lexend_Deca'] font-black border transition-all duration-200 ${
                      meta.jenjang === j.id
                        ? 'bg-gray-900 dark:bg-primary text-white border-gray-900 dark:border-primary shadow-md shadow-gray-900/10 dark:shadow-none'
                        : 'bg-white dark:bg-[#1C1A29] text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {t(`edu_levels.${j.id}`) !== `edu_levels.${j.id}` ? t(`edu_levels.${j.id}`) : j.label}
                  </button>
                ))}
               </div>

               <div className="flex gap-3">
                  <div className="flex-1 relative" ref={kelasDropdownRef}>
                      <div 
                         className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-[#1C1A29] border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-lg transition-all cursor-pointer"
                         onClick={(e) => {
                             e.stopPropagation();
                             setIsKelasDropdownOpen(prev => !prev);
                             setIsSemesterDropdownOpen(false);
                         }}
                      >
                         <span className="text-[14px] font-['Manrope'] text-gray-950 dark:text-gray-100 font-bold">
                             {meta.kelas ? formatClassOption(meta.jenjang, meta.kelas, language, t) : t('upload.choose_class')}
                         </span>
                         <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isKelasDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                      </div>
                      
                      {/* Kelas Dropdown List */}
                      <AnimatePresence>
                      {isKelasDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 rounded-xl shadow-lg dark:shadow-2xl max-h-60 overflow-y-auto no-scrollbar origin-top"
                        >
                          <div className="py-1">
                              {kelasOptions.map((k: string) => (
                                 <div
                                    key={k}
                                    onClick={() => {
                                        setMeta({ ...meta, kelas: k });
                                        setIsKelasDropdownOpen(false);
                                    }}
                                    className={`px-4 py-2.5 cursor-pointer transition-colors ${meta.kelas === k ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-medium'} text-[14px] font-['Manrope']`}
                                 >
                                     {formatClassOption(meta.jenjang, k, language, t)}
                                 </div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                  </div>

                  <div className="flex-1 relative" ref={semesterDropdownRef}>
                      <div 
                         className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-[#1C1A29] border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-lg transition-all cursor-pointer"
                         onClick={(e) => {
                             e.stopPropagation();
                             setIsSemesterDropdownOpen(prev => !prev);
                             setIsKelasDropdownOpen(false);
                         }}
                      >
                         <span className="text-[14px] font-['Manrope'] text-gray-950 dark:text-gray-100 font-bold">
                             {meta.semester ? formatSemesterOption(meta.semester, language, t) : t('upload.choose_semester')}
                         </span>
                         <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isSemesterDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                      </div>

                      {/* Semester Dropdown List */}
                      <AnimatePresence>
                      {isSemesterDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 rounded-xl shadow-lg dark:shadow-2xl max-h-60 overflow-y-auto no-scrollbar origin-top"
                        >
                          <div className="py-1">
                              {Array.from({ length: maxSemester }, (_, i) => i + 1).map((s) => (
                                 <div
                                    key={s}
                                    onClick={() => {
                                        setMeta({ ...meta, semester: s });
                                        setIsSemesterDropdownOpen(false);
                                    }}
                                    className={`px-4 py-2.5 cursor-pointer transition-colors ${meta.semester === s ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-medium'} text-[14px] font-['Manrope']`}
                                 >
                                     {formatSemesterOption(s, language, t)}
                                 </div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                  </div>
               </div>
            </div>

            {/* Tags Row */}
            <div className="mb-10">
              <p className="font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 text-[15px] mb-2">{t('upload.tags_title')}</p>
              <p className="text-[13px] text-gray-600 font-['Manrope'] mb-3 font-bold">{t('upload.tags_desc')}</p>
              
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
                placeholder={t('upload.add_tag')}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1C1A29] border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-lg text-[14px] font-['Manrope'] focus:outline-none focus:bg-white dark:focus:bg-[#252336] focus:border-primary/50 transition-all mb-3 text-gray-950 dark:text-gray-100 placeholder:text-gray-500 font-bold"
              />
              
              <div className="flex flex-wrap gap-2">
                 {meta.tags.map((tag: string) => (
                  <span key={tag} dir="auto" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#252336] text-gray-700 dark:text-gray-200 rounded text-[12px] font-['Manrope'] font-bold shrink-0">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Expert Verification Toggle */}
            <div className="mb-8 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl p-5">
               <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-['Lexend_Deca'] font-bold text-slate-800 dark:text-slate-100 text-[14px] mb-0.5">{t('upload.submit_expert')}</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-['Manrope'] font-medium leading-snug">{t('upload.submit_expert_desc')}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={meta.ajukanPakar}
                    onClick={() => setMeta({ ...meta, ajukanPakar: !meta.ajukanPakar })}
                    className={`relative shrink-0 w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${meta.ajukanPakar ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${meta.ajukanPakar ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
               </div>
            </div>

            {/* Publish Area */}
            <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
               <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="w-full sm:w-auto text-[15px] font-['Manrope'] text-gray-600 dark:text-gray-400 font-bold hover:text-gray-950 dark:hover:text-gray-200 transition-colors disabled:opacity-50 py-3.5"
                >
                  {isSavingDraft ? t('upload.saving_draft') : t('upload.save_draft')}
               </button>
               <button
                  onClick={handleSubmit}
                  disabled={!canPublishFinal || isSubmitting}
                  className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-xl text-[15px] font-['Manrope'] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20"
               >
                  {isSubmitting ? t('upload.publishing') : t('upload.publish_now')}
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
