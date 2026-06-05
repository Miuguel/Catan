import React, { useState } from "react";
import "../styles/trade-modal.css";
import type { ResourceType } from "../core/game/ResourceType";

export interface DiscardResult {
  ok: boolean;
  message: string;
}

interface DiscardModalProps {
  isOpen: boolean;
  playerName: string;
  required: number;
  available: Record<ResourceType, number>;
  onConfirm: (resources: Record<ResourceType, number>) => DiscardResult;
}

const RESOURCE_OPTIONS: Array<{
  type: ResourceType;
  label: string;
  icon: string;
}> = [
  { type: "brick", label: "Tijolo", icon: "🧱" },
  { type: "lumber", label: "Madeira", icon: "🪵" },
  { type: "wool", label: "Lã", icon: "🐑" },
  { type: "grain", label: "Trigo", icon: "🌾" },
  { type: "ore", label: "Minério", icon: "⛏️" },
];

function emptyCounts(): Record<ResourceType, number> {
  return { brick: 0, lumber: 0, wool: 0, grain: 0, ore: 0 };
}

export const DiscardModal: React.FC<DiscardModalProps> = ({
  isOpen,
  playerName,
  required,
  available,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<Record<ResourceType, number>>(
    emptyCounts(),
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const total = RESOURCE_OPTIONS.reduce(
    (sum, option) => sum + selected[option.type],
    0,
  );

  const change = (type: ResourceType, delta: number) => {
    setFeedback(null);
    setSelected((prev) => {
      const next = prev[type] + delta;

      if (next < 0 || next > available[type]) {
        return prev;
      }

      if (delta > 0 && total >= required) {
        return prev;
      }

      return { ...prev, [type]: next };
    });
  };

  const confirm = () => {
    if (total !== required) {
      setFeedback(`Selecione exatamente ${required} recursos.`);
      return;
    }

    const result = onConfirm(selected);

    if (!result.ok) {
      setFeedback(result.message);
    }
  };

  return (
    <div className="trade-modal-overlay">
      <div className="trade-modal">
        <div className="trade-modal__header">
          <h2>DESCARTE (saiu 7)</h2>
        </div>

        <div className="trade-modal__content" style={{ display: "block" }}>
          <p style={{ color: "#cbd5e1", margin: "0 0 12px" }}>
            {playerName}, você tem recursos demais. Descarte{" "}
            <strong>{required}</strong> ({total}/{required} selecionados).
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RESOURCE_OPTIONS.map((option) => (
              <div
                key={option.type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: available[option.type] === 0 ? 0.4 : 1,
                }}
              >
                <span style={{ color: "#cbd5e1" }}>
                  {option.icon} {option.label} (tem {available[option.type]})
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    className="trade-modal__btn-minus"
                    onClick={() => change(option.type, -1)}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 20, textAlign: "center" }}>
                    {selected[option.type]}
                  </span>
                  <button
                    className="trade-modal__btn-plus"
                    onClick={() => change(option.type, 1)}
                  >
                    +
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        {feedback && (
          <div className="trade-modal__feedback trade-modal__feedback--error">
            {feedback}
          </div>
        )}

        <div className="trade-modal__actions">
          <button
            className="trade-modal__btn-submit"
            style={{ opacity: total === required ? 1 : 0.5 }}
            disabled={total !== required}
            onClick={confirm}
          >
            ✓ DESCARTAR
          </button>
        </div>
      </div>
    </div>
  );
};
