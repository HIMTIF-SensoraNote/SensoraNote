import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  Square, 
  Trash2, 
  Plus, 
  MessageSquare, 
  ArrowLeft, 
  PanelLeftClose, 
  PanelLeft, 
  Lightbulb, 
  BookOpen, 
  GraduationCap, 
  Layers,
  RotateCcw,
  Loader2,
  AlertCircle,
  Terminal,
  Quote,
  X
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MobileLayout } from '../components/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const STORAGE_KEY = 'sensoranote_chat_sessions_v1';
const ACTIVE_SESSION_KEY = 'sensoranote_active_session_id';

// Subcomponent for Code Block with Copy Action
function ChatCodeBlock({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 sm:my-3 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 bg-[#161822] text-slate-100 shadow-sm font-mono text-[11.5px] sm:text-[13px] max-w-full w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1f2230] border-b border-white/5 text-slate-400 text-[10.5px] sm:text-[11px] select-none">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
          <Terminal className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400" />
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
          title="Salin kode"
        >
          {copied ? (
            <>
              <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 sm:p-4 overflow-x-auto max-w-full custom-scrollbar">
        <pre className="leading-relaxed whitespace-pre font-mono select-text">{code}</pre>
      </div>
    </div>
  );
}

// Subcomponent for LaTeX Block Math Formula
function ChatFormulaBlock({ latex }: { latex: string }) {
  let html = '';
  try {
    html = katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false });
  } catch {
    html = '';
  }

  return (
    <div className="my-2.5 sm:my-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 overflow-x-auto max-w-full text-center font-serif text-sm sm:text-base text-gray-900 dark:text-gray-100 select-text">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code className="font-mono text-xs text-blue-600 dark:text-blue-400">{latex}</code>
      )}
    </div>
  );
}

export default function ChatbotPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('chatbot.title') + ' — ' + t('chatbot.subtitle'));
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sessions state (persisted in localStorage)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || null;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Default sidebar: closed on mobile (< 768px), open on desktop (>= 768px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Active session object
  const currentSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = currentSession ? currentSession.messages : [];

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  }, [sessions]);

  // Persist active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, [activeSessionId]);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Starter Prompts
  const starterPrompts = [
    {
      icon: BookOpen,
      title: t('chatbot.starter_1'),
      prompt: 'Bantu saya memahami materi pelajaran berikut ini secara sederhana dan terstruktur: ',
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    },
    {
      icon: Lightbulb,
      title: t('chatbot.starter_2'),
      prompt: 'Buatkan ringkasan poin-poin penting dari konsep berikut: ',
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    },
    {
      icon: Layers,
      title: t('chatbot.starter_3'),
      prompt: 'Jelaskan bagaimana sistem huruf Braille bekerja dan bagaimana cara membacanya untuk pemula.',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    },
    {
      icon: GraduationCap,
      title: t('chatbot.starter_4'),
      prompt: 'Buatkan 3 soal kuis pilihan ganda beserta pembahasannya untuk topik: ',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    },
  ];

  // Create a new session
  const createNewSession = () => {
    window.speechSynthesis.cancel();
    setPlayingId(null);
    setErrorMessage(null);
    const newId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'Percakapan Baru',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Delete a session
  const deleteSession = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
    setSessionToDelete(null);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setErrorMessage(null);

    let targetSessionId = activeSessionId;
    let currentMessages: Message[] = [];

    // If no active session, create one immediately
    if (!targetSessionId || !sessions.some((s) => s.id === targetSessionId)) {
      targetSessionId = 'session_' + Date.now();
      const firstTitle = textToSend.trim().slice(0, 35) + (textToSend.trim().length > 35 ? '...' : '');
      const newSession: ChatSession = {
        id: targetSessionId,
        title: firstTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(targetSessionId);
    } else {
      const s = sessions.find((item) => item.id === targetSessionId);
      currentMessages = s ? s.messages : [];
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessagesWithUser = [...currentMessages, userMsg];

    // Update session state with user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          const isFirstMessage = s.messages.length === 0;
          return {
            ...s,
            title: isFirstMessage ? textToSend.trim().slice(0, 35) + (textToSend.trim().length > 35 ? '...' : '') : s.title,
            updatedAt: new Date().toISOString(),
            messages: updatedMessagesWithUser,
          };
        }
        return s;
      })
    );

    if (!customText) setInputMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Build conversation history format for API
      const historyPayload = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post(
        '/api/v1/chat/message',
        {
          message: textToSend.trim(),
          history: historyPayload,
        },
        { headers, withCredentials: true }
      );

      if (res.data?.status === 'success' && res.data?.reply) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, botMsg],
              };
            }
            return s;
          })
        );
      } else {
        throw new Error(res.data?.message || t('chatbot.error_generic'));
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errDetail = err?.response?.data?.message || err?.message || t('chatbot.error_generic');
      setErrorMessage(errDetail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-to-Speech handler
  const toggleSpeech = (id: string, text: string) => {
    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      utteranceRef.current = null;
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text from Markdown, LaTeX, and code blocks for natural speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' Blok kode pemrograman ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' Rumus ')
      .replace(/\$[^$]*\$/g, ' ')
      .replace(/^[#*`_~>-]+\s*/gm, '')
      .replace(/[*#`_~]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;
    utterance.lang = 'id-ID';
    utterance.onend = () => {
      setPlayingId(null);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setPlayingId(null);
      utteranceRef.current = null;
    };

    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Normalize any incoming HTML tags to standard Markdown
  const normalizeContent = (raw: string): string => {
    if (!raw) return '';
    return raw
      // Convert HTML headings to Markdown
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '### $1\n')
      .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '### $1\n')
      .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '### $1\n')
      // Convert HTML formatting to Markdown
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n')
      .replace(/<hr\s*\/?>/gi, '\n---\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
      .replace(/<\/?(ul|ol|p|div|span)[^>]*>/gi, '')
      .replace(/\n{3,}/g, '\n\n');
  };

  // Helper for inline styles (bold, italic, code, inline LaTeX $...$)
  const formatInlineStyles = (text: string) => {
    // Sanitize any remaining HTML tags
    const sanitized = text.replace(/<\/?(h[1-6]|strong|b|em|i|code|p|span|div)[^>]*>/gi, '');

    // Split by: $...$, **...**, `...`, *...*
    const parts = sanitized.split(/(\$[^\$]+?\$|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g);

    return parts.map((part, index) => {
      // Inline LaTeX $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2 && !part.startsWith('$$')) {
        const formula = part.slice(1, -1);
        try {
          const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
          return (
            <span 
              key={index} 
              className="inline-block max-w-full overflow-x-auto px-1 font-serif text-[14px] sm:text-[15px] text-blue-600 dark:text-blue-400 align-middle" 
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          );
        } catch {
          return <code key={index} className="text-xs bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded break-all">{part}</code>;
        }
      }

      // Bold **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={index} className="font-bold text-gray-900 dark:text-white break-words [overflow-wrap:anywhere]">{part.slice(2, -2)}</strong>;
      }

      // Inline Code `...`
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={index} className="px-1.5 py-0.5 mx-0.5 rounded-lg bg-gray-100 dark:bg-white/10 text-primary font-mono text-[12px] sm:text-[13px] border border-gray-200/50 dark:border-white/5 break-all">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Italic *...*
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={index} className="italic text-gray-800 dark:text-gray-200 break-words [overflow-wrap:anywhere]">{part.slice(1, -1)}</em>;
      }

      return part;
    });
  };

  // Comprehensive Markdown & LaTeX Renderer
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const normalized = normalizeContent(content);

    // Parse major blocks: Code blocks, block math, blockquotes, horizontal dividers, headings, lists
    const blocks: React.ReactNode[] = [];
    const lines = normalized.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Multi-line Code Block: ```language
      if (trimmed.startsWith('```')) {
        const language = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // Skip closing ```
        blocks.push(
          <ChatCodeBlock 
            key={`code_${i}`} 
            language={language} 
            code={codeLines.join('\n')} 
          />
        );
        continue;
      }

      // 2. Block LaTeX Formula: $$ formula $$ (multi-line or single line)
      if (trimmed.startsWith('$$')) {
        if (trimmed.endsWith('$$') && trimmed.length > 2) {
          // Single line block formula
          const latex = trimmed.slice(2, -2);
          blocks.push(<ChatFormulaBlock key={`formula_${i}`} latex={latex} />);
          i++;
          continue;
        } else {
          // Multi-line block formula
          const formulaLines: string[] = [];
          i++;
          while (i < lines.length && !lines[i].trim().endsWith('$$')) {
            formulaLines.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            formulaLines.push(lines[i].replace(/\$\$$/, ''));
            i++;
          }
          blocks.push(<ChatFormulaBlock key={`formula_${i}`} latex={formulaLines.join('\n')} />);
          continue;
        }
      }

      // 3. Horizontal Divider: --- or ***
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        blocks.push(
          <hr 
            key={`hr_${i}`} 
            className="my-3 sm:my-4 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/15 to-transparent" 
          />
        );
        i++;
        continue;
      }

      // 4. Blockquote / Kutipan: > quote text
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [trimmed.replace(/^>\s?/, '')];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        blocks.push(
          <blockquote 
            key={`quote_${i}`}
            className="my-2.5 sm:my-3 pl-3 sm:pl-4 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-r-xl sm:rounded-r-2xl border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-500/10 text-gray-700 dark:text-gray-300 text-[12.5px] sm:text-[13.5px] italic flex items-start gap-2 sm:gap-2.5 max-w-full overflow-hidden break-words [overflow-wrap:anywhere]"
          >
            <Quote className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1 min-w-0 break-words [overflow-wrap:anywhere]">
              {quoteLines.map((qLine, qIdx) => (
                <p key={qIdx} className="break-words [overflow-wrap:anywhere]">{formatInlineStyles(qLine)}</p>
              ))}
            </div>
          </blockquote>
        );
        continue;
      }

      // 5. Headings: #, ##, ###, ####, #####, ######
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].replace(/\s*#+$/, ''); // Remove any trailing #

        if (level === 1) {
          blocks.push(
            <h2 key={`h1_${i}`} className="font-['Lexend_Deca'] font-black text-[16px] sm:text-[18px] text-gray-900 dark:text-white mt-3.5 sm:mt-4 mb-1.5 sm:mb-2 pb-1 sm:pb-1.5 border-b border-gray-200 dark:border-white/10 break-words [overflow-wrap:anywhere]">
              {formatInlineStyles(text)}
            </h2>
          );
        } else if (level === 2) {
          blocks.push(
            <h3 key={`h2_${i}`} className="font-['Lexend_Deca'] font-extrabold text-[15px] sm:text-[16.5px] text-blue-600 dark:text-blue-400 mt-3 sm:mt-4 mb-1 sm:mb-1.5 pb-1 border-b border-blue-100 dark:border-blue-500/20 break-words [overflow-wrap:anywhere]">
              {formatInlineStyles(text)}
            </h3>
          );
        } else if (level === 3) {
          blocks.push(
            <h4 key={`h3_${i}`} className="font-['Lexend_Deca'] font-bold text-[14px] sm:text-[15px] text-gray-900 dark:text-gray-100 mt-2.5 sm:mt-3 mb-1 break-words [overflow-wrap:anywhere]">
              {formatInlineStyles(text)}
            </h4>
          );
        } else {
          // level 4, 5, 6
          blocks.push(
            <h5 key={`h4_${i}`} className="font-['Lexend_Deca'] font-bold text-[13px] sm:text-[14px] text-blue-600 dark:text-blue-400 mt-2 sm:mt-2.5 mb-0.5 sm:mb-1 break-words [overflow-wrap:anywhere]">
              {formatInlineStyles(text)}
            </h5>
          );
        }
        i++;
        continue;
      }

      // 6. Bullet Lists: * or -
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        blocks.push(
          <div key={`bullet_${i}`} className="flex items-start gap-2 pl-1 sm:pl-2 my-0.5 sm:my-1 min-w-0 max-w-full">
            <span className="text-primary mt-1 text-[8px] sm:text-[9px] font-bold shrink-0">•</span>
            <span className="flex-1 text-[13.5px] sm:text-[14px] leading-relaxed break-words [overflow-wrap:anywhere] min-w-0">{formatInlineStyles(trimmed.substring(2))}</span>
          </div>
        );
        i++;
        continue;
      }

      // 7. Numbered Lists: 1. 2.
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        blocks.push(
          <div key={`num_${i}`} className="flex items-start gap-2 pl-1 sm:pl-2 my-0.5 sm:my-1 min-w-0 max-w-full">
            <span className="text-primary font-bold text-[11px] sm:text-xs mt-0.5 min-w-[16px] sm:min-w-[18px] px-1 py-0.5 rounded bg-primary/10 text-center shrink-0">
              {numberedMatch[1]}
            </span>
            <span className="flex-1 text-[13.5px] sm:text-[14px] leading-relaxed break-words [overflow-wrap:anywhere] min-w-0">{formatInlineStyles(numberedMatch[2])}</span>
          </div>
        );
        i++;
        continue;
      }

      // 8. Empty lines
      if (!trimmed) {
        blocks.push(<div key={`empty_${i}`} className="h-1.5" />);
        i++;
        continue;
      }

      // 9. Regular Paragraph
      blocks.push(
        <p key={`p_${i}`} className="leading-relaxed text-[13.5px] sm:text-[14.5px] break-words [overflow-wrap:anywhere]">
          {formatInlineStyles(line)}
        </p>
      );
      i++;
    }

    return <div className="space-y-1.5 select-text w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">{blocks}</div>;
  };

  return (
    <MobileLayout hideSidebar={true} hideTopNav={true} hideMobileTopNav={true} showBottomNav={false}>
      {/* 
        'fixed inset-0 h-screen w-full max-w-full overflow-hidden' ensures zero horizontal page leak.
        Only the internal chat area & sidebar scroll independently.
      */}
      <div className="fixed inset-0 h-screen w-full max-w-full flex bg-white dark:bg-[#0E0C17] text-gray-900 dark:text-gray-100 overflow-hidden font-['Manrope'] z-50 select-none md:select-auto">
        
        {/* ========================================================= */}
        {/* MOBILE BACKDROP OVERLAY */}
        {/* ========================================================= */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ========================================================= */}
        {/* SIDEBAR: Riwayat Chat & Tombol Percakapan Baru */}
        {/* ========================================================= */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-40
            h-full bg-gray-50/95 dark:bg-[#141221] border-r border-gray-200/70 dark:border-white/5 
            flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden
            ${isSidebarOpen 
              ? 'w-72 sm:w-80 translate-x-0 shadow-2xl md:shadow-none' 
              : 'w-0 -translate-x-full md:translate-x-0 md:w-0'
            }
          `}
        >
          {/* Sidebar Top: Back to Home + Logo + Mobile Close */}
          <div className="p-3.5 sm:p-4 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between shrink-0 h-14">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Kembali ke Beranda SensoraNote"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Beranda</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sensora AI</span>
              </div>

              {/* Mobile Close Icon Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3 shrink-0">
            <button
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-['Lexend_Deca'] font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Percakapan Baru</span>
            </button>
          </div>

          {/* Sessions List (History) */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar min-h-0">
            <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 font-['Lexend_Deca']">
              Riwayat Percakapan
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-10 px-4 text-gray-600 dark:text-gray-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada riwayat chat.</p>
                <p className="text-[11px] mt-1 text-gray-500 dark:text-gray-500">Mulai chat baru untuk berdiskusi dengan AI.</p>
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'}`} />
                      <span className="text-xs truncate font-['Manrope']">{s.title || 'Percakapan Tanpa Judul'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToDelete(s.id);
                      }}
                      className="opacity-80 md:opacity-0 md:group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-all shrink-0 cursor-pointer"
                      title="Hapus percakapan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 sm:p-3.5 border-t border-gray-200/50 dark:border-white/5 bg-gray-100/50 dark:bg-[#110F1C] shrink-0 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 h-14">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="truncate font-medium">{user?.name || 'Pengguna'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300">
              Gemini Flash
            </span>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN CHAT AREA */}
        {/* ========================================================= */}
        <main className="flex-1 h-full flex flex-col relative w-full min-w-0 max-w-full bg-white dark:bg-[#0E0C17] overflow-hidden">
          
          {/* Top Bar Navigation */}
          <header className="h-14 px-3 sm:px-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#0E0C17]/80 backdrop-blur-md z-10 w-full max-w-full">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                title={isSidebarOpen ? 'Tutup Bilah Sisi' : 'Buka Bilah Sisi'}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-['Lexend_Deca'] font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">
                    {currentSession?.title || t('chatbot.title')}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
              <button
                onClick={createNewSession}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Mulai chat baru"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat Baru</span>
              </button>

              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Beranda</span>
              </button>
            </div>
          </header>

          {/* Messages Area - ONLY VERTICAL SCROLL */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar w-full max-w-full mx-auto min-h-0 transition-all duration-300 ${
            isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl 2xl:max-w-7xl'
          }`}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-3 sm:p-8 max-w-full">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 flex items-center justify-center text-primary mb-3 sm:mb-4 shadow-sm">
                  <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                  {t('chatbot.welcome_title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 sm:mb-8 font-['Manrope'] px-2">
                  {t('chatbot.welcome_subtitle')}
                </p>

                {/* Starter Prompts Grid */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left transition-all ${
                  isSidebarOpen ? 'max-w-2xl' : 'max-w-4xl'
                }`}>
                  {starterPrompts.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.prompt.endsWith(': ')) {
                          setInputMessage(item.prompt);
                          textareaRef.current?.focus();
                        } else {
                          handleSendMessage(item.prompt);
                        }
                      }}
                      className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-[#161424] border border-gray-200/60 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/40 hover:shadow-md transition-all group flex items-start gap-3 text-left cursor-pointer max-w-full"
                    >
                      <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${item.color} shrink-0`}>
                        <item.icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-[13px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors font-['Lexend_Deca'] truncate">
                          {item.title}
                        </h3>
                        <p className="text-[11px] sm:text-[11.5px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 sm:gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} group w-full max-w-full`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          isUser
                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                            : 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-sm shadow-blue-500/20'
                        }`}
                      >
                        {isUser ? (
                          user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[88%] sm:max-w-[82%] min-w-0 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-sm max-w-full overflow-hidden break-words [overflow-wrap:anywhere] ${
                            isUser
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-gray-50 dark:bg-[#161424] text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-white/5 rounded-tl-none'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-[13.5px] sm:text-[14.5px] leading-relaxed font-['Manrope'] select-text break-words [overflow-wrap:anywhere]">
                              {msg.content}
                            </p>
                          ) : (
                            <div className="max-w-full overflow-hidden">
                              {renderFormattedContent(msg.content)}
                            </div>
                          )}
                        </div>

                        {/* Actions for AI responses */}
                        {!isUser && (
                          <div className="flex items-center gap-1 sm:gap-1.5 mt-1 pl-1 text-[11px] sm:text-xs">
                            <button
                              onClick={() => toggleSpeech(msg.id, msg.content)}
                              className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg transition-colors cursor-pointer ${
                                playingId === msg.id
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                              }`}
                              title={playingId === msg.id ? t('chatbot.stop_audio') : t('chatbot.play_audio')}
                            >
                              {playingId === msg.id ? (
                                <>
                                  <Square className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="currentColor" />
                                  <span>{t('chatbot.stop_audio')}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                  <span>{t('chatbot.play_audio')}</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => copyToClipboard(msg.id, msg.content)}
                              className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              title={t('chatbot.copy')}
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-500" />
                                  <span className="text-emerald-500 font-bold">{t('chatbot.copied')}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                  <span>{t('chatbot.copy')}</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2.5 sm:gap-3.5 max-w-full">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-gray-50 dark:bg-[#161424] rounded-2xl rounded-tl-none border border-gray-200/50 dark:border-white/5 px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-['Manrope'] font-medium">Sensora AI sedang berpikir...</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm max-w-full">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="font-bold font-['Lexend_Deca']">Gagal memproses pesan AI:</p>
                        <p className="leading-relaxed break-words [overflow-wrap:anywhere]">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <footer className="p-2.5 sm:p-4 border-t border-gray-100 dark:border-white/5 bg-white/90 dark:bg-[#0E0C17]/90 backdrop-blur-md shrink-0 w-full max-w-full">
            <div className={`mx-auto transition-all duration-300 w-full max-w-full ${
              isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl 2xl:max-w-7xl'
            }`}>
              <div className="relative flex items-end gap-1.5 sm:gap-2 bg-gray-50 dark:bg-[#161424] rounded-2xl border border-gray-200/80 dark:border-white/10 p-1.5 sm:p-2 shadow-sm focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all max-w-full">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={handleInputResize}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chatbot.input_placeholder')}
                  rows={1}
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 resize-none px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 custom-scrollbar max-h-28 sm:max-h-36 select-text"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    inputMessage.trim() && !isLoading
                      ? 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 cursor-pointer'
                      : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  title={t('chatbot.send')}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-center text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 font-['Manrope'] font-medium truncate px-2">
                {t('chatbot.powered_by')} • Percakapan tersimpan di perangkat Anda.
              </p>
            </div>
          </footer>

        </main>

        {/* Delete Session Dialog */}
        <ConfirmDialog
          isOpen={!!sessionToDelete}
          onOpenChange={(open) => !open && setSessionToDelete(null)}
          title="Hapus Percakapan Ini?"
          description="Percakapan ini akan dihapus permanen dari riwayat chat Anda."
          onConfirm={() => sessionToDelete && deleteSession(sessionToDelete)}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="danger"
        />

      </div>
    </MobileLayout>
  );
}
