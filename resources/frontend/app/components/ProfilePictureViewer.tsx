import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ProfilePictureViewerProps {
    isOpen: boolean;
    imageUrl: string;
    altText?: string;
    isBanner?: boolean;
    onClose: () => void;
}

export const ProfilePictureViewer: React.FC<ProfilePictureViewerProps> = ({
    isOpen,
    imageUrl,
    altText = "Profile Picture",
    isBanner = false,
    onClose
}) => {
    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                title="Tutup"
            >
                <X size={24} />
            </button>
            
            <div 
                className={`relative ${isBanner ? 'max-w-5xl w-full max-h-[85vh] flex items-center justify-center' : 'max-w-[90vw] max-h-[90vh] aspect-square'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={imageUrl} 
                    alt={altText} 
                    className={`w-full h-full ${isBanner ? 'max-h-[80vh] object-contain rounded-2xl border-2 border-white/20' : 'object-cover rounded-full border-4 border-white/20'} shadow-2xl animate-in zoom-in-95 duration-200`}
                />
            </div>
        </div>,
        document.body
    );
};
