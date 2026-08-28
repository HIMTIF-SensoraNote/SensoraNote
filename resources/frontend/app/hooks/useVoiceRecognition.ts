import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Declaration for Web Speech API types
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

const SPEECH_LANG_MAP: Record<string, string> = {
  id: 'id-ID',
  en: 'en-US',
  'en-GB': 'en-GB',
  'en-US': 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-BR',
  ru: 'ru-RU',
  ar: 'ar-SA',
  hi: 'hi-IN',
  bn: 'bn-BD',
  ur: 'ur-PK',
  tr: 'tr-TR',
  vi: 'vi-VN',
  th: 'th-TH',
  nl: 'nl-NL',
  pl: 'pl-PL',
  ms: 'ms-MY',
  af: 'af-ZA',
  am: 'am-ET',
  cs: 'cs-CZ',
  da: 'da-DK',
  el: 'el-GR',
  fa: 'fa-IR',
  fi: 'fi-FI',
  he: 'he-IL',
  hu: 'hu-HU',
  km: 'km-KH',
  lo: 'lo-LA',
  my: 'my-MM',
  ne: 'ne-NP',
  pa: 'pa-IN',
  ro: 'ro-RO',
  si: 'si-LK',
  sv: 'sv-SE',
  sw: 'sw-KE',
  tl: 'fil-PH',
  uk: 'uk-UA',
  zu: 'zu-ZA',
};

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const { resolvedLanguage } = useLanguage();
  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef(false);
  
  // Base transcript accumulated from previous sessions before auto-restarts
  const baseTranscriptRef = useRef('');
  const transcriptRef = useRef('');

  // Keep transcriptRef synced
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Initialize SpeechRecognition instance
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const windowWithSpeech = window as unknown as IWindow;
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setError('Browser ini belum mendukung Web Speech Recognition. Gunakan Google Chrome, Edge, atau Safari.');
      return null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      const speechLang = SPEECH_LANG_MAP[resolvedLanguage] || 'id-ID';
      recognition.lang = speechLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let sessionFinal = '';
        let currentInterim = '';

        // Iterate through all results in the current session without double appending
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            sessionFinal += result[0].transcript + ' ';
          } else {
            currentInterim += result[0].transcript;
          }
        }

        const base = baseTranscriptRef.current ? baseTranscriptRef.current.trim() : '';
        const combinedFinal = (base ? base + ' ' : '') + sessionFinal.trim();

        setTranscript(combinedFinal.trim());
        setInterimTranscript(currentInterim.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          shouldKeepListeningRef.current = false;
          setError('Izin mikrofon tidak diizinkan. Mohon izinkan akses mikrofon di pengaturan browser Anda.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Normal brief silence, keep active if user hasn't stopped
        } else if (event.error === 'network') {
          console.warn('Speech recognition network warning');
        } else if (event.error !== 'aborted') {
          setError(`Info suara: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Store the current accumulated text into baseTranscriptRef so next auto-restart continues cleanly
        if (transcriptRef.current) {
          baseTranscriptRef.current = transcriptRef.current.trim();
        }

        if (shouldKeepListeningRef.current) {
          try {
            recognition.start();
            setIsListening(true);
          } catch (e) {
            setTimeout(() => {
              if (shouldKeepListeningRef.current) {
                try {
                  recognition.start();
                  setIsListening(true);
                } catch (err) {}
              }
            }, 250);
          }
        } else {
          setIsListening(false);
          setInterimTranscript('');
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (e: any) {
      console.error('Error creating SpeechRecognition:', e);
      return null;
    }
  }, [resolvedLanguage]);

  useEffect(() => {
    initRecognition();

    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [initRecognition]);

  const startListening = useCallback(async () => {
    setError(null);
    shouldKeepListeningRef.current = true;

    // Check secure context
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('Pengenalan suara membutuhkan koneksi aman HTTPS.');
    }

    // Request and immediately RELEASE mic stream so SpeechRecognition has sole access to the microphone
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr: any) {
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          shouldKeepListeningRef.current = false;
          setError('Akses mikrofon ditolak. Izinkan browser mengakses mikrofon Anda.');
          setIsListening(false);
          return;
        }
      }
    }

    let rec = recognitionRef.current;
    if (!rec) {
      rec = initRecognition();
    }

    if (!rec) return;

    try {
      rec.start();
      setIsListening(true);
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        // Already running
        setIsListening(true);
      } else {
        console.warn('Failed to start speech recognition, retrying:', err);
        try {
          rec.abort();
          setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              rec.start();
              setIsListening(true);
            }
          }, 150);
        } catch (e) {}
      }
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const handleSetTranscript = useCallback((textOrUpdater: string | ((prev: string) => string)) => {
    setTranscript((prev) => {
      const updated = typeof textOrUpdater === 'function' ? textOrUpdater(prev) : textOrUpdater;
      baseTranscriptRef.current = updated;
      transcriptRef.current = updated;
      return updated;
    });
  }, []);

  const resetTranscript = useCallback(() => {
    baseTranscriptRef.current = '';
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    setTranscript: handleSetTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}
