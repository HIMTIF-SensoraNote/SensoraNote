import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Input } from './input';
import { Button } from './button';
import { MessageSquare } from 'lucide-react';

interface PromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  confirmText?: string;
  cancelText?: string;
}

export function PromptDialog({
  isOpen,
  onOpenChange,
  title,
  placeholder = 'Ketik di sini...',
  defaultValue = '',
  onConfirm,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal'
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    onConfirm(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1C1A29] border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden p-0 gap-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
            <MessageSquare className="w-8 h-8" />
          </div>
          
          <DialogHeader className="items-center w-full">
            <DialogTitle className="font-['Lexend_Deca'] text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="w-full mt-4">
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-2xl h-12 px-4 focus:ring-2 focus:ring-indigo-500/20 transition-all font-['Manrope']"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
                if (e.key === 'Escape') {
                  onOpenChange(false);
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all font-['Lexend_Deca'] text-[13px] uppercase tracking-wider"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-2xl font-bold text-white shadow-lg transition-all font-['Lexend_Deca'] text-[13px] uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
