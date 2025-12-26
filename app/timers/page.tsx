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

  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState(0);
  const [newSeconds, setNewSeconds] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('savedTimers');
    if (saved) {
      setSavedTimers(JSON.parse(saved));
    } else {
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

  const addCustomTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || (newMinutes === 0 && newSeconds === 0)) return;

    const totalSeconds = (newMinutes * 60) + newSeconds;
    const newTimer: SavedTimer = {
        id: `custom-${Date.now()}`,
        label: newLabel,
        seconds: totalSeconds
    };

    const updated = [...savedTimers, newTimer];
    setSavedTimers(updated);
    localStorage.setItem('savedTimers', JSON.stringify(updated));
    
    // Reset form
    setNewLabel("");
    setNewMinutes(0);
    setNewSeconds(0);
    setShowAddForm(false);
  };

  const deleteTimer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent starting timer when clicking delete
    const updated = savedTimers.filter(t => t.id !== id);
    setSavedTimers(updated);
    localStorage.setItem('savedTimers', JSON.stringify(updated));
    if (activeTimer === id) {
        stopTimer();
    }
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
            {savedTimers.find(t => t.id === activeTimer)?.label || "타이머"}
          </p>
          <button className={styles.stopBtn} onClick={stopTimer}>
            중지
          </button>
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2>나의 타이머</h2>
        <button 
            className={styles.addBtnToggle}
            onClick={() => setShowAddForm(!showAddForm)}
        >
            {showAddForm ? '닫기' : '+ 추가'}
        </button>
      </div>

      {showAddForm && (
        <form className={styles.addForm} onSubmit={addCustomTimer}>
            <div className={styles.formGroup}>
                <label>이름</label>
                <input 
                    type="text" 
                    placeholder="예: 반숙란, 비빔면" 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    required
                />
            </div>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>분</label>
                    <input 
                        type="number" 
                        min="0" 
                        max="99"
                        value={newMinutes}
                        onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>초</label>
                    <input 
                        type="number" 
                        min="0" 
                        max="59"
                        value={newSeconds}
                        onChange={(e) => setNewSeconds(parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>
            <button type="submit" className={styles.saveBtn}>저장하기</button>
        </form>
      )}

      <div className={styles.timerGrid}>
        {savedTimers.map((timer) => (
          <div key={timer.id} className={styles.timerCard}>
            <button 
                className={styles.deleteBtn}
                onClick={(e) => deleteTimer(timer.id, e)}
                title="삭제"
            >
                ✕
            </button>
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
