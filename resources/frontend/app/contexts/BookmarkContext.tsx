import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface BookmarkContextType {
    bookmarkedIds: Set<string>;
    isBookmarked: (postId: string) => boolean;
    toggleBookmark: (postId: string) => Promise<void>;
    isLoading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
    undefined,
);

export function BookmarkProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Fetch bookmarks from the backend when user logs in
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setBookmarkedIds(new Set());
            return;
        }

        const fetchBookmarks = async () => {
            setIsLoading(true);
            try {
                const token =
                    localStorage.getItem("bayu-token") ||
                    sessionStorage.getItem("bayu-token");
                const res = await axios.get("/api/v1/bookmarks", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const ids: string[] = res.data?.bookmarkedIds || [];
                setBookmarkedIds(new Set(ids));
            } catch (err) {
                console.error("Failed to fetch bookmarks:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookmarks();
    }, [isAuthenticated, user]);

    const isBookmarked = useCallback(
        (postId: string) => {
            return bookmarkedIds.has(postId);
        },
        [bookmarkedIds],
    );

    const toggleBookmark = useCallback(async (postId: string) => {
        // Optimistic update — flip immediately for zero-lag UX
        setBookmarkedIds((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) {
                next.delete(postId);
            } else {
                next.add(postId);
            }
            return next;
        });

        // Fire the API call in the background
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            await axios.post(
                `/api/v1/posts/${postId}/bookmark`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
        } catch (err) {
            console.error("Failed to toggle bookmark:", err);
            // Revert on failure
            setBookmarkedIds((prev) => {
                const reverted = new Set(prev);
                if (reverted.has(postId)) {
                    reverted.delete(postId);
                } else {
                    reverted.add(postId);
                }
                return reverted;
            });
        }
    }, []);

    return (
        <BookmarkContext.Provider
            value={{ bookmarkedIds, isBookmarked, toggleBookmark, isLoading }}
        >
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);
    if (context === undefined) {
        throw new Error("useBookmarks must be used within a BookmarkProvider");
    }
    return context;
}
