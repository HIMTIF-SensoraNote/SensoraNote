import { useEffect } from 'react';

export function useDocumentTitle(title: string, appendSuffix: boolean = true) {
    useEffect(() => {
        if (!title) return;
        
        const suffix = ' | Ba-Yu';
        const finalTitle = appendSuffix ? `${title}${suffix}` : title;
        
        document.title = finalTitle;
    }, [title, appendSuffix]);
}
