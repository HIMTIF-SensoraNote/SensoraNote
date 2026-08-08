import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { getFormulaPresets } from './editor.constants';
import { useTranslation } from '../../hooks/useTranslation';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula: (latex: string) => void;
}

export function FormulaModal({ isOpen, onClose, onInsertFormula }: FormulaModalProps) {
  const { t } = useTranslation();
  const formulaPresets = getFormulaPresets(t);
  const initialTab = Object.keys(formulaPresets)[0] || '';
  const [formulaTab, setFormulaTab] = useState<string>(initialTab);
  const [formulaInput, setFormulaInput] = useState<string>('');

  if (!isOpen) return null;

  const insertFormula = (latex: string) => {
    onInsertFormula(latex);
    setFormulaInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1C1A29] rounded-2xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-['Lexend_Deca'] font-extrabold text-lg text-gray-900 dark:text-gray-100">
            {t('editor.insert_formula') !== 'editor.insert_formula' ? t('editor.insert_formula') : 'Sisipkan Rumus'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 pt-3">
          {/* Preset Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
            {Object.keys(formulaPresets).map(cat => (
              <button
                key={cat}
                onClick={() => setFormulaTab(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Manrope'] font-black whitespace-nowrap transition-colors ${
                  formulaTab === cat ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Preset Grid */}
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
            {formulaPresets[formulaTab]?.map(preset => (
              <button
                key={preset.label}
                onClick={() => insertFormula(preset.latex)}
                className="text-left p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-colors group overflow-hidden"
              >
                <p className="text-xs font-['Manrope'] font-bold text-gray-600 mb-1.5">{preset.label}</p>
                <div
                  className="text-sm overflow-auto no-scrollbar py-2"
                  dangerouslySetInnerHTML={{ __html: katex.renderToString(preset.latex, { throwOnError: false, displayMode: true }) }}
                />
              </button>
            ))}
          </div>
          {/* Custom Input */}
          <div className="p-5 border-t border-gray-100 dark:border-white/5 mt-3">
            <label className="block text-xs font-['Manrope'] font-black text-gray-600 mb-2 uppercase">
              {t('editor.custom_latex') !== 'editor.custom_latex' ? t('editor.custom_latex') : 'Atau tulis LaTeX sendiri'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formulaInput}
                onChange={e => setFormulaInput(e.target.value)}
                placeholder={t('editor.example') !== 'editor.example' ? t('editor.example') : 'Contoh: x^2 + y^2 = z^2'}
                className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary"
                onKeyDown={e => {
                  if (e.key === 'Enter' && formulaInput.trim()) {
                    e.preventDefault();
                    insertFormula(formulaInput.trim());
                  }
                }}
              />
              <button
                onClick={() => formulaInput.trim() && insertFormula(formulaInput.trim())}
                disabled={!formulaInput.trim()}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-['Manrope'] font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
              >
                {t('editor.insert') !== 'editor.insert' ? t('editor.insert') : 'Sisipkan'}
              </button>
            </div>
            {formulaInput.trim() && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-['Manrope'] text-gray-700 mb-1.5 uppercase tracking-wide font-black">
                  {t('editor.preview') !== 'editor.preview' ? t('editor.preview') : 'Preview'}
                </p>
                <div
                  className="overflow-auto no-scrollbar py-2"
                  dangerouslySetInnerHTML={{ __html: katex.renderToString(formulaInput, { throwOnError: false, displayMode: true }) }}
                />
              </div>
            )}
          </div>
          {/* Close */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-['Manrope'] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 transition-colors">
              {t('upload.cancel') !== 'upload.cancel' ? t('upload.cancel') : 'Batal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
