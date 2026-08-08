import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Mail, ArrowRight, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const VerifyEmailPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout, refreshUser } = useAuth();
    
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // If already verified, log out and redirect to login
        if (user && user.email_verified_at) {
            logout();
            navigate('/login');
        }
    }, [user, navigate, logout]);

    const handleResend = async () => {
        setIsResending(true);
        try {
            await axios.post('/api/email/resend');
            toast.success((t('verify_email.resend_success') || 'Email verifikasi berhasil dikirim ulang!'));
        } catch (error: any) {
            toast.error((t('verify_email.resend_failed') || 'Gagal mengirim ulang email.'));
        } finally {
            setIsResending(false);
        }
    };

    const handleCheckVerification = async () => {
        setIsChecking(true);
        try {
            const updatedUser = await refreshUser();
            if (updatedUser && updatedUser.email_verified_at) {
                toast.success((t('verify_email.verification_success') || 'Verifikasi Berhasil'));
                await logout();
                navigate('/login');
            } else {
                toast.error((t('verify_email.not_verified_yet') || 'Email belum diverifikasi. Cek inbox Anda.'));
            }
        } catch (error) {
            console.error('Error checking verification status', error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8 z-10">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-10 w-10 text-primary" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-foreground mb-4 font-lexend">
                    {(t('verify_email.title') || 'Verifikasi Email Anda')}
                </h1>

                <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                    {(t('verify_email.description') || 'Kami telah mengirimkan tautan verifikasi ke alamat email Anda. Silakan klik tautan tersebut untuk memverifikasi akun Anda dan mendapatkan akses penuh.')}
                </p>

                <div className="bg-secondary/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">{(t('verify_email.check_inbox') || 'Periksa Kotak Masuk Anda')}</h4>
                        <p className="text-xs text-muted-foreground">{(t('verify_email.spam_note') || 'Jika Anda tidak melihat email tersebut, periksa folder spam atau sampah Anda.')}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleCheckVerification}
                        disabled={isChecking}
                        className="w-full h-[50px] bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-70"
                    >
                        {isChecking ? (t('common.loading') || 'Memuat...') : (t('verify_email.already_verified') || 'Saya sudah memverifikasi')}
                        {!isChecking && <ArrowRight className="h-5 w-5" />}
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="w-full h-[50px] bg-card border border-border text-foreground font-semibold rounded-xl flex items-center justify-center transition-all hover:bg-accent disabled:opacity-70"
                    >
                        {isResending ? (t('verify_email.resend_loading') || 'Mengirim...') : (t('verify_email.resend_btn') || 'Kirim Ulang Email')}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full h-[50px] text-muted-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:text-foreground"
                    >
                        <LogOut className="h-4 w-4" />
                        {(t('verify_email.back_to_login') || 'Kembali ke Login')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
