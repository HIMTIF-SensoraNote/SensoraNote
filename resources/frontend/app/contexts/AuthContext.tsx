import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import axios from "axios";
import { useTranslation } from '../hooks/useTranslation';

export type UserRole = "user" | "pakar" | "admin";

export interface User {
    id?: string;
    _id?: string;
    email: string;
    name: string;
    username?: string;
    role: UserRole;
    jenjang_pendidikan?: string;
    profesi?: string;
    avatar?: string;
    bio?: string;
    school?: string;
    phone?: string;
    followers_count?: number;
    following_count?: number;
    created_at?: string;
    is_private?: boolean;
    is_dormant?: boolean;
    deactivated_at?: string;
    username_updated_at?: string;
    profile_completed?: boolean;
    email_verified_at?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (
        loginId: string,
        password: string,
        rememberMe?: boolean,
    ) => Promise<string | null>; // Returns error string if failed, null if success
    socialLogin: (token: string) => void;
    exchangeAndLogin: (code: string) => Promise<string | null>;
    register: (
        name: string,
        username: string,
        email: string,
        password: string,
        jenjang: string,
        profesi: string,
    ) => Promise<string | null>;
    logout: () => void;
    updateUserSession: (data: Partial<User>) => void;
    refreshUser: () => Promise<User | null>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    // Setup Axios defaults
    // Dihapus hardcode baseURL agar Axios otomatis mengikuti port tempat aplikasi berjalan (misal: 8001)
    axios.defaults.headers.common["Accept"] = "application/json";
    axios.defaults.withCredentials = true;

    const refreshUser = async (): Promise<User | null> => {
        const token =
            sessionStorage.getItem("bayu-token") ||
            localStorage.getItem("bayu-token");

        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            try {
                const response = await axios.get("/api/user");
                const userData = {
                    ...response.data,
                    jenjang_pendidikan:
                        response.data.jenjang_pendidikan || "SMP",
                };
                setUser(userData);
                return userData;
            } catch (error) {
                console.error("Failed to refresh user", error);
                return null;
            }
        }
        return null;
    };

    const loadUser = async () => {
        await refreshUser();
        setIsLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (
        loginId: string,
        password: string,
        rememberMe: boolean = false,
    ): Promise<string | null> => {
        try {
            const response = await axios.post("/api/v1/login", {
                login: loginId,
                password,
            });

            const { access_token, user: userData } = response.data;

            if (rememberMe) {
                localStorage.setItem("bayu-token", access_token);
            } else {
                sessionStorage.setItem("bayu-token", access_token);
            }
            axios.defaults.headers.common["Authorization"] =
                `Bearer ${access_token}`;

            setUser(userData);
            return null;
        } catch (error: any) {
            console.error("Login failed", error);
            const errorMsg = error.response?.data?.message;
            return (
                (errorMsg ? t(errorMsg) : t('auth.error_login')) || "Login gagal. Periksa kembali email dan password."
            );
        }
    };

    const socialLogin = async (token: string) => {
        localStorage.setItem("bayu-token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await loadUser(); // Muat ulang data user dengan token baru dan tunggu sampai selesai
    };

    const exchangeAndLogin = async (code: string): Promise<string | null> => {
        try {
            const response = await axios.post("/api/v1/auth/oauth-exchange", { code });
            const { access_token } = response.data;
            if (!access_token) {
                return t('auth.error_no_token') || "Token tidak diterima dari server.";
            }
            await socialLogin(access_token);
            return null;
        } catch (error: any) {
            console.error("OAuth exchange failed", error);
            const errorMsg = error.response?.data?.message;
            return (
                (errorMsg ? t(errorMsg) : t('auth.error_oauth_expired')) || "Sesi OAuth kadaluwarsa, silakan login ulang."
            );
        }
    };

    const register = async (
        name: string,
        username: string,
        email: string,
        password: string,
        jenjang: string,
        profesi: string,
    ): Promise<string | null> => {
        try {
            const response = await axios.post("/api/v1/register", {
                name,
                username,
                email,
                password,
                jenjang_pendidikan: jenjang,
                profesi: profesi,
            });

            const { access_token, data: userData } = response.data;

            localStorage.setItem("bayu-token", access_token);
            axios.defaults.headers.common["Authorization"] =
                `Bearer ${access_token}`;

            setUser(userData);
            return null;
        } catch (error: any) {
            console.error("Registration failed", error);
            // Backend sent validation errors
            if (
                error.response?.data &&
                typeof error.response.data === "object" &&
                !error.response.data.message
            ) {
                const firstErrorKey = Object.keys(error.response.data)[0];
                const errorMsg = error.response.data[firstErrorKey][0];
                return t(errorMsg);
            }
            const errorMsg = error.response?.data?.message;
            return (
                (errorMsg ? t(errorMsg) : t('auth.error_register')) || "Registrasi gagal. Coba gunakan email lain."
            );
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("bayu-token");
        sessionStorage.removeItem("bayu-token");
        delete axios.defaults.headers.common["Authorization"];
        // Let the App Router handle the redirect to '/' when `user` becomes null inside a ProtectedRoute
    };

    const updateUserSession = (data: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full bg-[#06050E] text-slate-100 overflow-hidden flex items-center justify-center font-sans select-none">
                {/* 1. Subtle Space Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
                
                {/* 2. Soft Glowing Lights in the background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] bg-[#5D5CE6]/[0.08] pointer-events-none z-0 animate-pulse" />

                {/* 3. Center Loader Content */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Glowing Logo centerpiece with spinning border */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        {/* Elegant glowing spinner border */}
                        <div className="absolute inset-0 rounded-full border-2 border-[#5D5CE6]/20 border-t-[#5D5CE6] animate-spin" />
                        
                        {/* Central Logo */}
                        <img 
                            src="/logo.svg" 
                            alt="Ba-Yu Logo" 
                            className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(93,92,230,0.4)] animate-pulse" 
                        />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col items-center gap-1 text-center">
                        <span className="font-mono text-[10px] tracking-[0.25em] text-[#8B5CF6] uppercase">
                            AUTHENTICATING
                        </span>
                        <p className="text-slate-300 text-sm font-medium tracking-wide">
                            {t('auth.loading_session') || 'Memuat sesi...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                socialLogin,
                exchangeAndLogin,
                register,
                logout,
                updateUserSession,
                refreshUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
