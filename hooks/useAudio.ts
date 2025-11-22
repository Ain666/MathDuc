
import { useCallback, useRef } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((count = 1, duration = 0.1, frequency = 880) => {
    const context = getAudioContext();
    if (!context) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + duration / 10);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration);
      }, i * (duration * 1000 + 50));
    }
  }, [getAudioContext]);
  
  const playCompletionSound = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;

    const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.7, startTime + duration * 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = context.currentTime;
    playNote(600, now, 0.15);
    playNote(900, now + 0.15, 0.2);
  }, [getAudioContext]);

  return { playBeep, playCompletionSound };
};