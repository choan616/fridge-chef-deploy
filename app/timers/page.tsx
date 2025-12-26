"use client";

import { useState, useEffect } from "react";
import styles from "./timers.module.css";

interface SavedTimer {
  id: string;
  label: string;
  seconds: number;
}

export default function TimersPage() {
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>([]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('savedTimers');
    if (saved) {
      setSavedTimers(JSON.parse(saved));
    } else {
      // 기본 타이머 설정
      const defaults: SavedTimer[] = [
        { id: 'ramen', label: '라면', seconds: 240 },
        { id: 'egg', label: '계란 삶기', seconds: 360 },
        { id: 'pasta', label: '파스타 면', seconds: 480 },
      ];
      setSavedTimers(defaults);
      localStorage.setItem('savedTimers', JSON.stringify(defaults));
    }
  }, []);

  useEffect(() => {
    if (activeTimer && remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setActiveTimer(null);
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance('타이머가 끝났습니다!');
              utterance.lang = 'ko-KR';
              window.speechSynthesis.speak(utterance);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTimer, remainingTime]);

  const startTimer = (timer: SavedTimer) => {
    setActiveTimer(timer.id);
    setRemainingTime(timer.seconds);
  };

  const stopTimer = () => {
    setActiveTimer(null);
    setRemainingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>스마트 타이머</h1>
        <p>자주 쓰는 타이머를 저장하고 빠르게 사용하세요</p>
      </header>

      {activeTimer && (
        <div className={styles.activeTimer}>
          <div className={styles.timeDisplay}>{formatTime(remainingTime)}</div>
          <p className={styles.timerLabel}>
            {savedTimers.find(t => t.id === activeTimer)?.label}
          </p>
          <button className={styles.stopBtn} onClick={stopTimer}>
            중지
          </button>
        </div>
      )}

      <div className={styles.timerGrid}>
        {savedTimers.map((timer) => (
          <div key={timer.id} className={styles.timerCard}>
            <h3>{timer.label}</h3>
            <p className={styles.duration}>{formatTime(timer.seconds)}</p>
            <button
              className={styles.startBtn}
              onClick={() => startTimer(timer)}
              disabled={activeTimer === timer.id}
            >
              {activeTimer === timer.id ? '실행 중' : '시작'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
