import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'primary'
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1C1A29] border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden p-0 gap-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${variant === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <DialogHeader className="items-center">
            <DialogTitle className="font-['Lexend_Deca'] text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="font-['Manrope'] text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed px-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
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
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`flex-1 h-12 rounded-2xl font-bold text-white shadow-lg transition-all font-['Lexend_Deca'] text-[13px] uppercase tracking-wider ${variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
