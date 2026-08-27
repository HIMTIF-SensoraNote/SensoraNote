import { useState, useEffect, useRef, useCallback } from 'react';

// Declaration for Web Speech API types
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    const windowWithSpeech = window as unknown as IWindow;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Browser ini belum mendukung Web Speech Recognition. Gunakan Google Chrome, Edge, atau Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalStr += result[0].transcript + ' ';
        } else {
          interimStr += result[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev ? prev.trim() + ' ' + finalStr.trim() : finalStr.trim()));
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error === 'not-allowed') {
        shouldKeepListeningRef.current = false;
        setError('Izin mikrofon ditolak. Mohon izinkan akses mikrofon di pengaturan browser Anda.');
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        // Just a brief silence, auto-keep listening if active
        if (shouldKeepListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      } else if (event.error !== 'aborted') {
        setError(`Info suara: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If user has not clicked stop, auto-restart to allow unlimited long duration!
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          // May throw if restarting too rapidly
          setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              try {
                recognition.start();
                setIsListening(true);
              } catch (err) {}
            }
          }, 300);
        }
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    if (!recognitionRef.current) return;

    shouldKeepListeningRef.current = true;

    try {
      // Trigger noise suppression & echo cancellation hardware filters
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
      }

      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      if (err.name === 'NotAllowedError') {
        shouldKeepListeningRef.current = false;
        setError('Akses mikrofon ditolak. Izinkan browser mengakses mikrofon Anda.');
      } else {
        // Recognition might already be running, set state to true
        try {
          recognitionRef.current.start();
        } catch (e) {}
        setIsListening(true);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}
