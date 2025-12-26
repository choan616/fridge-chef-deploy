"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */


import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RecipeStep } from "@/types";
import { getSubstitutesAction } from "@/app/actions";
import styles from "./CookingChat.module.css";

interface Props {
  steps: RecipeStep[];
  recipeId: string;
  title: string;
}

export default function CookingChat({ steps, recipeId, title }: Props) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [substitutes, setSubstitutes] = useState<any>(null);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [servings, setServings] = useState(2);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const indexRef = useRef(currentStepIndex);

  // Sync ref for voice command callback
  useEffect(() => {
    indexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      if (onEnd) {
        utterance.onend = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // TTS Effect
  useEffect(() => {
    if (isVoiceMode && currentStep && !isCompleted) {
      speak(currentStep.instruction, () => {
        // After reading instruction, ask if they want to move to next step
        setTimeout(() => {
            speak("다음계로 넘어갈까요?");
        }, 1000);
      });
    }
  }, [currentStepIndex, isVoiceMode, currentStep, isCompleted]);

  // Handlers
  const handleHome = () => {
    router.push('/');
  };

  const handleSave = () => {
    const saved = localStorage.getItem('savedRecipes');
    const recipes = saved ? JSON.parse(saved) : [];
    // Check if already saved
    if (!recipes.some((r: any) => r.id === recipeId)) {
        recipes.push({ id: recipeId, title, steps, date: new Date().toISOString() });
        localStorage.setItem('savedRecipes', JSON.stringify(recipes));
        alert('레시피가 저장되었습니다!');
    } else {
        alert('이미 저장된 레시피입니다.');
    }
  };

  const handleGetSubstitutes = async () => {
    setIsLoadingSubs(true);
    setSubstitutes(null);
    try {
        const result = await getSubstitutesAction("주요 재료", title);
        setSubstitutes(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoadingSubs(false);
    }
  };

  const startVoiceTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setTimerActive(true);
    speak(`${minutes}분 타이머를 시작합니다`);
  };

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            speak('타이머가 끝났습니다!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timerSeconds]);

  // Voice Recognition Effect
  useEffect(() => {
    let recognition: any = null;
    let shouldRestart = true;

    if (isVoiceMode && !isCompleted && typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
      recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const text = event.results[lastIndex][0].transcript.trim();
        console.log("Voice Command:", text);

        if (text.includes("이전") || text.includes("뒤로")) {
          setCurrentStepIndex(prev => Math.max(prev - 1, 0));
        } else if (
            text.includes("다음") || 
            text.includes("넘겨") || 
            text.includes("가자") ||
            text.includes("네") ||
            text.includes("응") ||
            text.includes("어") ||
            text.includes("그래")
        ) {
          if (isLastStep) {
             setIsCompleted(true);
             speak("요리가 완성되었습니다. 수고하셨어요!");
          } else {
             setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
          }
        } else if (text.includes("다시") || text.includes("읽어") || text.includes("뭐라고")) {
          const step = steps[indexRef.current];
          if (step) speak(step.instruction);
        } else if (text.includes("타이머")) {
          const match = text.match(/(\d+)분/);
          if (match) {
            const mins = parseInt(match[1]);
            startVoiceTimer(mins);
          }
        } else if (isLastStep && (text.includes("저장") || text.includes("홈") || text.includes("처음"))) {
            if (text.includes("홈") || text.includes("처음")) handleHome();
            if (text.includes("저장")) handleSave();
        }
      };

      recognition.onend = () => {
        if (shouldRestart && isVoiceMode) {
          try { recognition.start(); } catch (e) {
            console.log("Recognition restart failed", e);
          }
        }
      };

      try { recognition.start(); } catch (e) {
        console.error("Recognition start failed", e);
      }
    }

    return () => {
      shouldRestart = false;
      if (recognition) recognition.stop();
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, [isVoiceMode, steps, isLastStep, isCompleted]);

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (isCompleted) {
        setIsCompleted(false);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };



  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
        if (typeof window === "undefined" || !(window as any).webkitSpeechRecognition) {
            alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
            return;
        }
    }
    setIsVoiceMode(!isVoiceMode);
  };

  if (isCompleted) {
      return (
        <div className={styles.container}>
            <div className={styles.chatArea}>
                <div className={styles.messageBubble}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉 요리 완성!</h2>
                    <p className={styles.instruction}>맛있게 드세요!</p>
                </div>
                <div className={styles.controls} style={{ marginTop: '2rem', width: '100%' }}>
                     <button className={styles.primaryButton} onClick={handleHome}>
                        🏠 처음으로 (홈)
                     </button>
                     <button 
                        className={styles.actionButton} 
                        onClick={handleSave}
                        style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}
                     >
                        💾 레시피 저장하기
                     </button>
                     <button 
                        className={styles.navButton} 
                        onClick={() => setIsCompleted(false)}
                        style={{ marginTop: '1rem', width: '100%' }}
                     >
                        ← 다시 레시피 보기
                     </button>
                </div>
            </div>
        </div>
      );
  }

  if (!currentStep) return <div>No steps available.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        단계 {currentStepIndex + 1} / {steps.length}
        <div className={styles.servingControl}>
          <button onClick={() => setServings(Math.max(1, servings - 1))}>-</button>
          <span>{servings}인분</span>
          <button onClick={() => setServings(servings + 1)}>+</button>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        {timerActive && (
          <div className={styles.timerBadge}>
            ⏱️ {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      <div className={styles.chatArea}>
        <div className={styles.messageBubble}>
          <p className={styles.instruction}>{currentStep.instruction}</p>
          {currentStep.tip && (
            <div className={styles.tip}>
              <strong>팁:</strong> {currentStep.tip}
            </div>
          )}
        </div>

        {isLoadingSubs && <div className={styles.loadingSubs}>대체 재료를 찾는 중...</div>}
        
        {substitutes && (
          <div className={styles.substitutesArea}>
            <h3>💡 {substitutes.ingredient} 대체 제안</h3>
            <ul>
              {substitutes.substitutes.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <p className={styles.advice}>{substitutes.advice}</p>
            <button className={styles.closeSubs} onClick={() => setSubstitutes(null)}>닫기</button>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.secondaryControls}>
          <button 
            className={`${styles.actionButton} ${isVoiceMode ? styles.voiceActive : ''}`}
            onClick={toggleVoiceMode}
            title={isVoiceMode ? "음성 모드 끄기" : "음성 모드 켜기 (명령어: 넘겨줘, 이전, 읽어줘)"}
          >
            {isVoiceMode ? "🎙️ ON" : "🔇 OFF"}
          </button>
          <button 
            className={styles.navButton} 
            onClick={handlePrev} 
            disabled={currentStepIndex === 0}
          >
            ← 이전
          </button>
          <button className={styles.actionButton} onClick={handleGetSubstitutes}>대체 재료?</button>
        </div>
        
        <button 
          className={styles.primaryButton} 
          onClick={handleNext}
        >
          {isLastStep ? "요리 완성! (마무리)" : "다음 단계 →"}
        </button>
      </div>
    </div>
  );
}
