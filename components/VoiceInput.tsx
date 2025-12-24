"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */


import { useState, useEffect } from "react";
import styles from "./VoiceInput.module.css";

interface Props {
  onResult: (text: string) => void;
}

export default function VoiceInput({ onResult }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
      const r = new (window as any).webkitSpeechRecognition();
      r.continuous = false;
      r.interimResults = false;
      r.lang = "ko-KR";
      
      r.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onResult(text);
        setIsListening(false);
      };

      r.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      r.onend = () => {
        setIsListening(false);
      };

      setRecognition(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (!recognition) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.");
        return;
    }
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button 
        className={`${styles.button} ${isListening ? styles.listening : ''}`}
        onClick={toggleListening}
        title="음성으로 입력하기"
        type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </button>
  );
}
