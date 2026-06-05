import React, { useState, useEffect, useRef } from 'react';
import '../styles/dice-roller.css';
import { Dice } from './Dice';

interface DiceRollerProps {
  isRolling: boolean;
  die1: number;
  die2: number;
  total: number;
  onRollingComplete?: () => void;
}

// Duração da animação de rolagem. Deve ser igual ao totalDuration do Dice.tsx
const ROLL_DURATION_MS = 1000;

export const DiceRoller: React.FC<DiceRollerProps> = ({
  isRolling,
  die1,
  die2,
  onRollingComplete,
}) => {
  const [showTotal, setShowTotal] = useState(false);
  const [visible, setVisible] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const die1Ref = useRef(die1);
  const die2Ref = useRef(die2);
  useEffect(() => { die1Ref.current = die1; }, [die1]);
  useEffect(() => { die2Ref.current = die2; }, [die2]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    if (isRolling) {
      clearAll();
      setShowTotal(false);

      // Mostrar o roller e depois fazer a sequência de timeouts
      const t0 = setTimeout(() => {
        setVisible(true);
      }, 0);

      // Após a animação de rolagem terminar, mostrar o total
      const t1 = setTimeout(() => {
        const t2 = setTimeout(() => {
          setShowTotal(true);
        }, 300);

        // Chamar callback 1,5s depois (tempo para o jogador ver o resultado)
        const t3 = setTimeout(() => {
          onRollingComplete?.();
          setVisible(false);
          setShowTotal(false);
        }, 1800);

        timeoutsRef.current.push(t2, t3);
      }, ROLL_DURATION_MS);

      timeoutsRef.current.push(t0, t1);

      return () => clearAll();
    }
  }, [isRolling, onRollingComplete]);

  if (!visible) return null;

  // Total sempre calculado dos valores reais dos dados
  const computedTotal = die1 + die2;

  return (
    <div className={`dice-roller dice-roller--${isRolling ? 'rolling' : 'complete'}`}>
      <div className="dice-roller__container">
        <Dice finalValue={die1} isRolling={isRolling} />

        <div className="dice-roller__plus">+</div>

        <Dice finalValue={die2} isRolling={isRolling} />

        {showTotal && (
          <>
            <div className="dice-roller__equals">=</div>
            <div className="dice-roller__total dice-roller__total--complete">
              <span style={{ fontSize: '48px', fontWeight: '900' }}>{computedTotal}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
