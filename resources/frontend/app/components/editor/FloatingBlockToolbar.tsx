import React, { useState, useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { Trash2, CornerDownLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface FloatingBlockToolbarProps {
  quillRef: React.RefObject<ReactQuill | null>;
  onEditAlt: (index: number, currentAlt: string) => void;
}

export function FloatingBlockToolbar({ quillRef, onEditAlt }: FloatingBlockToolbarProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeBlot, setActiveBlot] = useState<{ index: number; type: string } | null>(null);
  const [currentLayout, setCurrentLayout] = useState('inline');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const evaluateTarget = (target: HTMLElement) => {
        const block = target.closest('img, iframe, .ql-video, .ql-formula, pre.ql-syntax, blockquote') as HTMLElement;
        if (block) {
            const tagName = block.tagName;
            const type = tagName === 'IMG' ? 'image' : 
                         (tagName === 'IFRAME' || block.classList?.contains('ql-video') ? 'video' : 
                         block.classList?.contains('ql-formula') ? 'formula' : 
                         tagName === 'PRE' ? 'code-block' : 'blockquote');
                         
            const rect = block.getBoundingClientRect();
            const editorRect = (quill.root.parentElement as HTMLElement).getBoundingClientRect();
            
            const blot = Quill.find(block);
            if (!blot) return false;
            
            const index = quill.getIndex(blot);
            
            if (type === 'image' || type === 'video' || type === 'formula') {
                let left = editorRect.left + (rect.left - editorRect.left) + (rect.width / 2) - 60;
                setPosition({
                    top: rect.top - 52,
                    left: Math.max(8, Math.min(left, window.innerWidth - 120)),
                });
                if (type === 'image') setCurrentLayout(block.getAttribute('data-layout') || 'inline');
            } else {
                setPosition({
                    top: rect.top - 16,
                    left: Math.min(editorRect.right - 50, window.innerWidth - 60),
                });
            }
            
            setActiveBlot({ index, type });
            return true;
        }
        return false;
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
        if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) {
            return;
        }
        
        if (quill.root.contains(e.target as Node)) {
            const isHandled = evaluateTarget(e.target as HTMLElement);
            if (isHandled) return;
        }
        
        const range = quill.getSelection();
        if (range) {
             const [line] = quill.getLine(range.index);
             if (line && line.domNode && (line.domNode.tagName === 'PRE' || line.domNode.tagName === 'BLOCKQUOTE')) {
                 evaluateTarget(line.domNode as HTMLElement);
                 return;
             }
             if (range.length === 1) {
                 const [leaf] = quill.getLeaf(range.index);
                 if (leaf && leaf.domNode && (leaf.domNode.tagName === 'IMG' || leaf.domNode.tagName === 'IFRAME' || leaf.domNode.classList?.contains('ql-formula') || leaf.domNode.classList?.contains('ql-video'))) {
                     evaluateTarget(leaf.domNode as HTMLElement);
                     return;
                 }
             }
        }
        
        setPosition(null);
        setActiveBlot(null);
    };

    const updatePosition = () => {
      if (activeBlot !== null) {
        const [blot] = quill.getLine(activeBlot.index);
        const [leaf] = quill.getLeaf(activeBlot.index);
        if (blot && blot.domNode && (blot.domNode.tagName === 'PRE' || blot.domNode.tagName === 'BLOCKQUOTE')) {
             evaluateTarget(blot.domNode as HTMLElement);
        } else if (leaf && leaf.domNode) {
             evaluateTarget(leaf.domNode as HTMLElement);
        }
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => { 
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
    };
  }, [quillRef, activeBlot]);

  if (!position || activeBlot === null) return null;

  const setLayout = (layout: string) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    quill.formatText(activeBlot.index, 1, 'layout', layout);
    setCurrentLayout(layout);
  };

  const handleAltClick = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const [blot] = quill.getLeaf(activeBlot.index);
    if (blot && blot.domNode) {
        const currentAlt = blot.domNode.getAttribute('alt') || '';
        onEditAlt(activeBlot.index, currentAlt);
    }
  };

  const handleDelete = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    
    if (activeBlot.type === 'image' || activeBlot.type === 'video' || activeBlot.type === 'formula') {
       quill.deleteText(activeBlot.index, 1, 'user');
    } else {
       // It's a block like code-block
       const [line] = quill.getLine(activeBlot.index);
       if (line) {
         const len = line.length();
         quill.deleteText(activeBlot.index, len, 'user');
       }
    }
    
    // Fallback: If editor is completely empty, insert a newline so it doesn't break
    if (quill.getLength() <= 1) {
      quill.insertText(0, '\n', 'user');
    }
    
    setPosition(null);
    setActiveBlot(null);
  };

  const handleEscapeBlock = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const [line] = quill.getLine(activeBlot.index);
    if (line) {
        const index = quill.getIndex(line) + line.length();
        quill.insertText(index, '\n', 'user');
        // Pastikan baris baru bersih dari format block
        quill.formatLine(index, 1, 'code-block', false);
        quill.formatLine(index, 1, 'blockquote', false);
        quill.setSelection(index, 0, 'user');
    }
    setPosition(null);
    setActiveBlot(null);
  };

  const btnClass = (active: boolean) =>
    `w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${active ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] px-1.5 py-1.5 flex items-center gap-1 border border-gray-200/80 dark:border-white/10 relative">
        {activeBlot.type === 'image' && (
          <>
            <button className={btnClass(currentLayout === 'inline')} onClick={() => setLayout('inline')} title={t('upload.layout_inline') || "Standard / Center"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><rect x="7" y="5" width="10" height="14" rx="2"/><line x1="10" y1="9" x2="14" y2="9"/><line x1="10" y1="13" x2="14" y2="13"/></svg>
            </button>
            <button className={btnClass(currentLayout === 'wide')} onClick={() => setLayout('wide')} title={t('upload.layout_wide') || "Lebar (Wide)"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><rect x="4" y="5" width="16" height="14" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="17" y2="13"/></svg>
            </button>
            <button className={btnClass(currentLayout === 'fullBleed')} onClick={() => setLayout('fullBleed')} title={t('upload.layout_full') || "Penuh (Full Bleed)"}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="13" x2="20" y2="13"/></svg>
            </button>
            
            <div className="w-px h-5 bg-gray-200 dark:bg-white/20 mx-1.5"></div>
            
            <button onClick={handleAltClick} className="px-3 h-8 text-[12px] font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
              {t('upload.alt_text_button') || 'Alt text'}
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-white/20 mx-1.5"></div>
          </>
        )}

        {(activeBlot.type === 'code-block' || activeBlot.type === 'blockquote') && (
          <>
            <button onClick={handleEscapeBlock} className="px-3 h-8 text-[12px] font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5" title={t('upload.escape_block') || 'Baris Baru di Luar Blok'}>
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enter Baru</span>
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-white/20 mx-1.5"></div>
          </>
        )}
        
        <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-500 dark:text-rose-400 hover:text-white hover:bg-rose-500 transition-colors" title={t('upload.delete_block') || "Hapus Blok"}>
           <Trash2 className="w-4 h-4" strokeWidth={2.5} />
        </button>
        
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 dark:bg-gray-900/95 border-b border-r border-gray-200/80 dark:border-white/10 rotate-45" />
      </div>
    </div>
  );
}
