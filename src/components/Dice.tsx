import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/dice.css';

interface DiceProps {
  finalValue: number;   // valor final real (1-6). Só usado ao parar
  isRolling: boolean;
}

// Frames de rolagem (dados em ângulos intermediários)
const ROLL_FRAMES = [
  '/dice/roll_01.png',
  '/dice/roll_02.png',
  '/dice/roll_03.png',
  '/dice/roll_04.png',
  '/dice/roll_05.png',
  '/dice/roll_06.png',
  '/dice/roll_07.png',
  '/dice/roll_08.png',
];

// Faces finais (dado parado mostrando resultado)
const FACE_FRAMES: Record<number, string> = {
  1: '/dice/dice_1.png',
  2: '/dice/dice_2.png',
  3: '/dice/dice_3.png',
  4: '/dice/dice_4.png',
  5: '/dice/dice_5.png',
  6: '/dice/dice_6.png',
};

export const Dice: React.FC<DiceProps> = ({ finalValue, isRolling }) => {
  const [currentFrame, setCurrentFrame] = useState(FACE_FRAMES[finalValue] || FACE_FRAMES[1]);
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'landing'>('idle');
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const animRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalValueRef = useRef(finalValue);

  useEffect(() => {
    finalValueRef.current = finalValue;
  }, [finalValue]);

  const stopAnimation = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRolling) {
      stopAnimation();
      setPhase('rolling');

      let frameIndex = 0;
      let lastFrameSwap = 0;
      let elapsed = 0;
      let prevTimestamp = 0;
      const totalDuration = 1000;

      const animate = (timestamp: number) => {
        if (!prevTimestamp) prevTimestamp = timestamp;
        const delta = timestamp - prevTimestamp;
        prevTimestamp = timestamp;
        elapsed += delta;

        const progress = Math.min(elapsed / totalDuration, 1);

        // Frame delay: começa muito rápido (20ms), desacelera suavemente
        const frameDelay = 20 + progress * progress * 80;

        // Movimento lateral + vertical leve (diminui com o tempo)
        const intensity = (1 - progress) * 0.8;
        setOffsetX(Math.sin(elapsed * 0.012) * 6 * intensity + (Math.random() - 0.5) * 3 * intensity);
        setOffsetY(Math.cos(elapsed * 0.015) * 4 * intensity + (Math.random() - 0.5) * 2 * intensity);

        // Trocar frame de rolagem
        const timeSinceSwap = timestamp - lastFrameSwap;
        if (timeSinceSwap >= frameDelay) {
          frameIndex = (frameIndex + 1) % ROLL_FRAMES.length;
          setCurrentFrame(ROLL_FRAMES[frameIndex]);
          lastFrameSwap = timestamp;
        }

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          // Animação terminou — mostrar a face final correta
          const fv = finalValueRef.current;
          const faceSrc = FACE_FRAMES[fv] ?? FACE_FRAMES[1];
          setCurrentFrame(faceSrc);
          setPhase('landing');
          setOffsetX(0);
          setOffsetY(0);
          timeoutRef.current = setTimeout(() => setPhase('idle'), 600);
        }
      };

      animRef.current = requestAnimationFrame(animate);
      return () => stopAnimation();
    } else {
      // Não está rolando: mostrar face correta imediatamente
      stopAnimation();
      setPhase('idle');
      setOffsetX(0);
      setOffsetY(0);
      setCurrentFrame(FACE_FRAMES[finalValue] ?? FACE_FRAMES[1]);
    }
  }, [isRolling, stopAnimation]);

  useEffect(() => {
    if (!isRolling && phase === 'idle') {
      setCurrentFrame(FACE_FRAMES[finalValue] ?? FACE_FRAMES[1]);
    }
  }, [finalValue, isRolling, phase]);

  return (
    <div
      className={`dice-sprite dice-sprite--${phase}`}
      style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
    >
      <img
        src={currentFrame}
        alt="Dado"
        className="dice-sprite__img"
        draggable={false}
      />
    </div>
  );
};
