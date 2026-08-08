import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import {
  Plus, X, Image as ImageIcon, Film, Code, Terminal, Minus, Quote,
  Bold, Italic, Underline, Highlighter, Link as LinkIcon,
  Heading1, Heading2, Calculator, List, ListOrdered, ChevronDown,
  AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { HIGHLIGHT_COLORS } from './editor.constants';
import { PromptDialog } from '../ui/PromptDialog';
import { useTranslation } from '../../hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';

interface SideToolbarProps {
  quillRef: React.RefObject<ReactQuill | null>;
  onFormulaClick: () => void;
}

// Portal dropdown – renders at document.body to escape overflow clipping
function PortalDropdown({ anchorRef, children, isOpen, portalRef }: {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  isOpen: boolean;
  portalRef: React.RefObject<HTMLDivElement>;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 180; // Approximate dropdown width
      const isRightAligned = rect.left + dropdownWidth > window.innerWidth;

      setStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        ...(isRightAligned ? { right: window.innerWidth - rect.right } : { left: Math.max(10, rect.left) }),
        zIndex: 9999,
      });
    }
  }, [isOpen, anchorRef]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={portalRef}
          style={style}
          onMouseDown={e => e.preventDefault()}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="origin-top-left"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function SideToolbar({ quillRef, onFormulaClick }: SideToolbarProps) {
  const { t } = useTranslation();
  const [formats, setFormats] = useState<Record<string, any>>({});
  const [expandedPlus, setExpandedPlus] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const insertBtnRef = useRef<HTMLButtonElement>(null);
  const highlightBtnRef = useRef<HTMLButtonElement>(null);
  // Refs for portal content — used to exclude from "outside click" detection
  const insertPortalRef = useRef<HTMLDivElement>(null);
  const highlightPortalRef = useRef<HTMLDivElement>(null);
  // Store the last known selection so we can restore it
  const savedSelectionRef = useRef<{ index: number; length: number } | null>(null);

  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    placeholder: string;
    value: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    placeholder: '',
    value: '',
    onConfirm: () => {},
  });

  // Track active formats on selection change & save selection
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const updateFormats = () => {
      const range = quill.getSelection();
      if (range) {
        setFormats(quill.getFormat(range.index, range.length));
        savedSelectionRef.current = range;
      }
    };

    quill.on('selection-change', updateFormats);
    quill.on('text-change', updateFormats);
    return () => {
      quill.off('selection-change', updateFormats);
      quill.off('text-change', updateFormats);
    };
  }, [quillRef]);

  // Close dropdowns on outside click — exclude portal content
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      const inContainer = containerRef.current?.contains(target);
      const inInsertPortal = insertPortalRef.current?.contains(target);
      const inHighlightPortal = highlightPortalRef.current?.contains(target);
      if (!inContainer && !inInsertPortal && !inHighlightPortal) {
        setExpandedPlus(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Helper: get quill editor, restoring selection if needed
  const getQuill = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return null;
    // Ensure the editor has focus and a selection
    const range = quill.getSelection();
    if (!range && savedSelectionRef.current) {
      quill.setSelection(savedSelectionRef.current.index, savedSelectionRef.current.length, 'silent');
    }
    quill.focus();
    return quill;
  }, [quillRef]);

  const toggle = useCallback((format: string, value?: any) => {
    const quill = getQuill();
    if (!quill) return;
    const range = quill.getSelection(true);
    if (!range) return;
    const current = quill.getFormat(range.index, range.length);
    if (format === 'header') {
      quill.format('header', current.header === value ? false : value);
    } else if (format === 'link') {
      if (current.link) {
        quill.format('link', false);
      } else {
        // Save range before opening dialog (dialog will steal focus)
        const savedRange = { ...range };
        setPromptConfig({
          isOpen: true,
          title: t('editor.insert_link'),
          placeholder: t('editor.link_placeholder'),
          value: '',
          onConfirm: (url) => {
            if (url) {
              const q = quillRef.current?.getEditor();
              if (q) {
                q.setSelection(savedRange.index, savedRange.length, 'silent');
                q.focus();
                q.format('link', url);
              }
            }
          }
        });
        return; // Don't update formats here — dialog is open
      }
    } else if (format === 'list') {
      quill.format('list', current.list === value ? false : value);
    } else if (format === 'align') {
      quill.format('align', current.align === value ? false : value);
    } else {
      quill.format(format, !current[format]);
    }
    const newRange = quill.getSelection();
    if (newRange) setFormats(quill.getFormat(newRange.index, newRange.length));
  }, [getQuill, quillRef]);

  const applyHighlight = useCallback((color: string) => {
    const quill = getQuill();
    if (!quill) return;
    const range = quill.getSelection(true);
    if (!range) return;
    const current = quill.getFormat(range.index, range.length);
    quill.format('background', current.background === color ? false : color);
    setShowColorPicker(false);
    const newRange = quill.getSelection();
    if (newRange) setFormats(quill.getFormat(newRange.index, newRange.length));
  }, [getQuill]);

  const removeHighlight = useCallback(() => {
    const quill = getQuill();
    if (!quill) return;
    const range = quill.getSelection(true);
    if (!range) return;
    quill.format('background', false);
    setShowColorPicker(false);
    const newRange = quill.getSelection();
    if (newRange) setFormats(quill.getFormat(newRange.index, newRange.length));
  }, [getQuill]);

  const insertBlock = useCallback((type: string) => {
    const quill = getQuill();
    if (!quill) return;
    const range = quill.getSelection(true);
    if (!range) return;
    switch (type) {
      case 'image': {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const captionText = t('editor.image_caption');
              quill.insertEmbed(range.index, 'image', reader.result, 'user');
              quill.formatText(range.index, 1, 'layout', 'inline');
              quill.insertText(range.index + 1, '\n' + captionText, 'user');
              quill.formatLine(range.index + 2, 1, 'align', 'center');
              quill.formatText(range.index + 2, captionText.length, 'color', '#9ca3af');
              quill.formatText(range.index + 2, captionText.length, 'italic', true);
              quill.insertText(range.index + 2 + captionText.length, '\n', 'user');
              quill.formatLine(range.index + 3 + captionText.length, 1, 'align', false);
              quill.formatText(range.index + 3 + captionText.length, 1, 'color', false);
              quill.formatText(range.index + 3 + captionText.length, 1, 'italic', false);
              quill.setSelection(range.index + 2, captionText.length, 'user');
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        break;
      }
      case 'video': {
        const savedRange = { ...range };
        setPromptConfig({
          isOpen: true,
          title: t('editor.insert_video'),
          placeholder: t('editor.video_placeholder'),
          value: '',
          onConfirm: (rawUrl) => {
            if (rawUrl) {
              const q = quillRef.current?.getEditor();
              if (!q) return;
              q.setSelection(savedRange.index, savedRange.length, 'silent');
              q.focus();
              let finalUrl = rawUrl;
              if (rawUrl.includes('youtu.be/')) {
                const videoId = rawUrl.split('youtu.be/')[1].split('?')[0];
                finalUrl = `https://www.youtube.com/embed/${videoId}`;
              } else if (rawUrl.includes('youtube.com/watch')) {
                const safeUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
                try {
                  const urlParams = new URLSearchParams(new URL(safeUrl).search);
                  const videoId = urlParams.get('v');
                  if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
                } catch (e) {}
              }
              const captionText = t('editor.video_caption');
              q.insertEmbed(savedRange.index, 'video', finalUrl, 'user');
              q.insertText(savedRange.index + 1, '\n' + captionText, 'user');
              q.formatLine(savedRange.index + 2, 1, 'align', 'center');
              q.formatText(savedRange.index + 2, captionText.length, 'color', '#9ca3af');
              q.formatText(savedRange.index + 2, captionText.length, 'italic', true);
              q.insertText(savedRange.index + 2 + captionText.length, '\n', 'user');
              q.formatLine(savedRange.index + 3 + captionText.length, 1, 'align', false);
              q.formatText(savedRange.index + 3 + captionText.length, 1, 'color', false);
              q.formatText(savedRange.index + 3 + captionText.length, 1, 'italic', false);
              q.setSelection(savedRange.index + 2, captionText.length, 'user');
            }
          }
        });
        break;
      }
      case 'code': {
        quill.insertText(range.index, '\n', 'user');
        quill.formatLine(range.index, 1, 'code-block', true);
        quill.setSelection(range.index, 0);
        break;
      }
      case 'divider': {
        quill.insertEmbed(range.index, 'divider', true, 'user');
        quill.insertText(range.index + 1, '\n', 'user');
        quill.setSelection(range.index + 2, 0);
        break;
      }
      case 'quote': {
        quill.formatLine(range.index, 1, 'blockquote', true);
        break;
      }
      case 'formula': {
        onFormulaClick();
        break;
      }
    }
    setExpandedPlus(false);
  }, [getQuill, onFormulaClick, quillRef]);

  const insertActions = [
    { id: 'image', icon: ImageIcon, label: t('editor.image'), color: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' },
    { id: 'video', icon: Film, label: t('editor.video'), color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10' },
    { id: 'code', icon: Terminal, label: t('editor.code'), color: 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10' },
    { id: 'formula', icon: Calculator, label: t('editor.formula'), color: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10' },
    { id: 'divider', icon: Minus, label: t('editor.divider'), color: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5' },
    { id: 'quote', icon: Quote, label: t('editor.quote'), color: 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10' },
  ];

  const btnClass = (active: boolean) =>
    `relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 shrink-0 ${
      active
        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
        : 'text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-white/10'
    }`;

  const Divider = () => (
    <div className="w-px h-5 bg-slate-200 dark:bg-white/10 shrink-0 mx-1" />
  );

  const dropdownBase = 'bg-white dark:bg-[#1C1A29] rounded-2xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.55)] border border-slate-200/70 dark:border-white/10';

  return (
    <>
      {/* ─── Horizontal Toolbar Bar ─── */}
      <div
        ref={containerRef}
        className="relative z-30 bg-white/95 dark:bg-[#13111C]/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5 shadow-sm"
        onMouseDown={e => e.preventDefault()}
      >
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-0.5 py-1.5 overflow-x-auto scrollbar-hide">

            {/* ── Heading ── */}
            <button className={btnClass(formats.header === 1)} onClick={() => toggle('header', 1)} title="Heading 1">
              <Heading1 className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(formats.header === 2)} onClick={() => toggle('header', 2)} title="Heading 2">
              <Heading2 className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>

            <Divider />

            {/* ── Text Formatting ── */}
            <button className={btnClass(!!formats.bold)} onClick={() => toggle('bold')} title="Bold">
              <Bold className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(!!formats.italic)} onClick={() => toggle('italic')} title="Italic">
              <Italic className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(!!formats.underline)} onClick={() => toggle('underline')} title="Underline">
              <Underline className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(!!formats.code)} onClick={() => toggle('code')} title="Inline Code">
              <Code className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>

            <Divider />

            {/* ── Alignment ── */}
            <button className={btnClass(!formats.align)} onClick={() => toggle('align', false)} title="Align Left">
              <AlignLeft className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(formats.align === 'center')} onClick={() => toggle('align', 'center')} title="Align Center">
              <AlignCenter className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(formats.align === 'right')} onClick={() => toggle('align', 'right')} title="Align Right">
              <AlignRight className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(formats.align === 'justify')} onClick={() => toggle('align', 'justify')} title="Justify">
              <AlignJustify className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>

            {/* ── Highlight ── */}
            <button
              ref={highlightBtnRef}
              className={btnClass(!!formats.background)}
              onClick={() => { setShowColorPicker(v => !v); setExpandedPlus(false); }}
              title="Highlight"
            >
              <Highlighter className="w-[15px] h-[15px]" strokeWidth={2.5} />
              {formats.background && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[3px] rounded-full"
                  style={{ background: formats.background }}
                />
              )}
            </button>

            <Divider />

            {/* ── Link ── */}
            <button className={btnClass(!!formats.link)} onClick={() => toggle('link')} title="Link">
              <LinkIcon className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>

            <Divider />

            {/* ── List ── */}
            <button className={btnClass(formats.list === 'bullet')} onClick={() => toggle('list', 'bullet')} title="Bullet List">
              <List className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(formats.list === 'ordered')} onClick={() => toggle('list', 'ordered')} title="Numbered List">
              <ListOrdered className="w-[15px] h-[15px]" strokeWidth={2.5} />
            </button>
            <button className={btnClass(formats.list === 'alpha')} onClick={() => toggle('list', 'alpha')} title="ABC List">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
                <line x1="10" x2="21" y1="6" y2="6"/>
                <line x1="10" x2="21" y1="12" y2="12"/>
                <line x1="10" x2="21" y1="18" y2="18"/>
                <text x="4" y="8" fontSize="6.5" stroke="none" fill="currentColor" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">A</text>
                <text x="4" y="14" fontSize="6.5" stroke="none" fill="currentColor" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">B</text>
                <text x="4" y="20" fontSize="6.5" stroke="none" fill="currentColor" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">C</text>
              </svg>
            </button>

            <Divider />

            {/* ── Insert Block ── */}
            <button
              ref={insertBtnRef}
              onClick={() => { setExpandedPlus(v => !v); setShowColorPicker(false); }}
              className={`flex items-center gap-1 px-2.5 h-8 rounded-lg text-[12px] font-['Lexend_Deca'] font-bold transition-all duration-200 shrink-0 ${
                expandedPlus
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
              }`}
              title={t('editor.insert_block_title')}
            >
              <Plus className={`w-[14px] h-[14px] transition-transform duration-300 ${expandedPlus ? 'rotate-45' : ''}`} strokeWidth={2.5} />
              <span className="hidden sm:inline">{t('editor.insert')}</span>
              <ChevronDown className={`w-3 h-3 hidden sm:inline transition-transform duration-300 ${expandedPlus ? 'rotate-180' : ''}`} strokeWidth={2.5} />
            </button>

          </div>
        </div>
      </div>

      {/* ─── Portal: Highlight Color Picker ─── */}
      <PortalDropdown anchorRef={highlightBtnRef} isOpen={showColorPicker} portalRef={highlightPortalRef}>
        <div className={`${dropdownBase} p-3`}>
          <p className="text-[10px] font-['Lexend_Deca'] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('editor.highlight_color')}</p>
          <div className="flex items-center gap-1.5 mb-2.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => applyHighlight(c.color)}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 active:scale-100 ${
                  formats.background === c.color ? 'border-indigo-500 scale-110 shadow-sm shadow-indigo-400/30' : 'border-transparent'
                }`}
                style={{ background: c.color }}
                title={c.label}
              />
            ))}
          </div>
          <button
            onClick={removeHighlight}
            className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-[11px] font-bold"
          >
            <X className="w-3 h-3" strokeWidth={3} /> {t('editor.remove_color')}
          </button>
        </div>
      </PortalDropdown>

      {/* ─── Portal: Insert Block Menu ─── */}
      <PortalDropdown anchorRef={insertBtnRef} isOpen={expandedPlus} portalRef={insertPortalRef}>
        <div className={`${dropdownBase} p-2 min-w-[160px]`}>
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 px-2 pt-1 pb-2">{t('editor.insert_block_title')}</p>
          <div className="flex flex-col gap-0.5">
            {insertActions.map((action) => (
            <button
              key={action.id}
              onClick={() => insertBlock(action.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-['Manrope'] font-semibold transition-all duration-150 ${action.color}`}
            >
              <action.icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              {action.label}
            </button>
          ))}
          </div>
        </div>
      </PortalDropdown>

      <PromptDialog
        isOpen={promptConfig.isOpen}
        onOpenChange={(open) => setPromptConfig(prev => ({ ...prev, isOpen: open }))}
        title={promptConfig.title}
        placeholder={promptConfig.placeholder}
        defaultValue={promptConfig.value}
        onConfirm={promptConfig.onConfirm}
        cancelText={t('upload.cancel')}
        confirmText={t('upload.confirm')}
      />
    </>
  );
}
