import React, { useState } from "react";
import "../styles/trade-modal.css";
import type { DevelopmentCardType } from "../core/game/DevelopmentCard";
import type { ResourceType } from "../core/game/ResourceType";

export interface DevCardPlayResult {
  ok: boolean;
  message: string;
}

export interface CardHandEntry {
  type: DevelopmentCardType;
  name: string;
  total: number;
  playable: number;
}

interface DevelopmentCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: CardHandEntry[];
  victoryPointCards: number;
  canPlayThisTurn: boolean;
  deckCount: number;
  onPlayKnight: () => DevCardPlayResult;
  onPlayMonopoly: (resource: ResourceType) => DevCardPlayResult;
  onPlayYearOfPlenty: (
    resources: Record<ResourceType, number>,
  ) => DevCardPlayResult;
  onPlayRoadBuilding: () => DevCardPlayResult;
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

const CARD_DESCRIPTIONS: Record<DevelopmentCardType, string> = {
  knight: "Mova o ladrão e roube um recurso de um adversário.",
  "victory-point": "Vale 1 ponto de vitória (conta automaticamente).",
  monopoly: "Escolha um recurso e receba todas as unidades dos adversários.",
  "year-of-plenty": "Pegue até 2 recursos do banco.",
  "road-building": "Construa até 2 estradas grátis.",
};

function emptyCounts(): Record<ResourceType, number> {
  return { brick: 0, lumber: 0, wool: 0, grain: 0, ore: 0 };
}

export const DevelopmentCardsModal: React.FC<DevelopmentCardsModalProps> = ({
  isOpen,
  onClose,
  entries,
  victoryPointCards,
  canPlayThisTurn,
  deckCount,
  onPlayKnight,
  onPlayMonopoly,
  onPlayYearOfPlenty,
  onPlayRoadBuilding,
}) => {
  const [configuring, setConfiguring] = useState<
    "monopoly" | "year-of-plenty" | null
  >(null);
  const [monopolyResource, setMonopolyResource] = useState<ResourceType>("brick");
  const [plentyCounts, setPlentyCounts] = useState<Record<ResourceType, number>>(
    emptyCounts(),
  );
  const [feedback, setFeedback] = useState<DevCardPlayResult | null>(null);

  if (!isOpen) {
    return null;
  }

  const apply = (result: DevCardPlayResult) => {
    setFeedback(result);

    if (result.ok) {
      setConfiguring(null);
      setMonopolyResource("brick");
      setPlentyCounts(emptyCounts());
      onClose();
    }
  };

  const plentyTotal = RESOURCE_OPTIONS.reduce(
    (sum, option) => sum + plentyCounts[option.type],
    0,
  );

  const changePlenty = (type: ResourceType, delta: number) => {
    setFeedback(null);
    setPlentyCounts((prev) => {
      const next = Math.max(0, prev[type] + delta);
      const others = RESOURCE_OPTIONS.reduce(
        (sum, option) =>
          option.type === type ? sum : sum + prev[option.type],
        0,
      );

      if (others + next > 2) {
        return prev;
      }

      return { ...prev, [type]: next };
    });
  };

  return (
    <div className="trade-modal-overlay">
      <div className="trade-modal">
        <div className="trade-modal__header">
          <h2>CARTAS DE DESENVOLVIMENTO</h2>
          <button className="trade-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="trade-modal__content development-modal__content">
          {!canPlayThisTurn && (
            <p className="development-modal__warning">
              Você já jogou uma carta neste turno.
            </p>
          )}

          {configuring === null && (
            <div className="development-modal__list">
              {entries.map((entry) => {
                const lockedNow = entry.playable === 0;
                const disabled = !canPlayThisTurn || lockedNow;

                return (
                  <div key={entry.type} className="development-modal__entry">
                    <div>
                      <div className="development-modal__entry-title">
                        {entry.name} ×{entry.total}
                      </div>
                      <div className="development-modal__entry-description">
                        {CARD_DESCRIPTIONS[entry.type]}
                        {lockedNow && entry.total > 0
                          ? " (comprada neste turno — jogável a partir do próximo)"
                          : ""}
                      </div>
                    </div>
                    <button
                      className="trade-modal__btn-submit development-modal__submit"
                      disabled={disabled}
                      onClick={() => {
                        setFeedback(null);
                        if (entry.type === "knight") {
                          apply(onPlayKnight());
                        } else if (entry.type === "road-building") {
                          apply(onPlayRoadBuilding());
                        } else if (entry.type === "monopoly") {
                          setConfiguring("monopoly");
                        } else if (entry.type === "year-of-plenty") {
                          setConfiguring("year-of-plenty");
                        }
                      }}
                    >
                      Jogar
                    </button>
                  </div>
                );
              })}

              <div className="development-modal__summary-card">
                Pontos de Vitória na mão: <strong>{victoryPointCards}</strong>{" "}
                (contam automaticamente). Baralho restante:{" "}
                <strong>{deckCount}</strong>.
              </div>
            </div>
          )}

          {configuring === "monopoly" && (
            <div className="development-modal__config">
              <h3>Escolha o recurso do Monopólio</h3>
              <div className="development-modal__resource-tabs">
                {RESOURCE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    className={`trade-modal__tab ${monopolyResource === option.type ? "active" : ""}`}
                    onClick={() => setMonopolyResource(option.type)}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {configuring === "year-of-plenty" && (
            <div className="development-modal__config">
              <h3>Escolha até 2 recursos (banco)</h3>
              <div className="development-modal__resource-list">
                {RESOURCE_OPTIONS.map((option) => (
                  <div key={option.type} className="development-modal__resource-row">
                    <span className="development-modal__resource-label">
                      {option.icon} {option.label}
                    </span>
                    <span className="development-modal__resource-controls">
                      <button
                        className="trade-modal__btn-minus"
                        onClick={() => changePlenty(option.type, -1)}
                      >
                        −
                      </button>
                      <span className="development-modal__resource-count">
                        {plentyCounts[option.type]}
                      </span>
                      <button
                        className="trade-modal__btn-plus"
                        onClick={() => changePlenty(option.type, 1)}
                      >
                        +
                      </button>
                    </span>
                  </div>
                ))}
              </div>
              <p className="development-modal__hint">
                Selecionados: {plentyTotal} / 2
              </p>
            </div>
          )}
        </div>

        {feedback && (
          <div
            className={`trade-modal__feedback ${feedback.ok ? "trade-modal__feedback--ok" : "trade-modal__feedback--error"}`}
          >
            {feedback.message}
          </div>
        )}

        <div className="trade-modal__actions">
          {configuring === "monopoly" && (
            <button
              className="trade-modal__btn-submit"
              onClick={() => apply(onPlayMonopoly(monopolyResource))}
            >
              ✓ CONFIRMAR MONOPÓLIO
            </button>
          )}
          {configuring === "year-of-plenty" && (
            <button
              className="trade-modal__btn-submit"
              onClick={() => {
                if (plentyTotal < 1) {
                  setFeedback({
                    ok: false,
                    message: "Escolha pelo menos 1 recurso.",
                  });
                  return;
                }
                apply(onPlayYearOfPlenty(plentyCounts));
              }}
            >
              ✓ CONFIRMAR
            </button>
          )}
          <button
            className="trade-modal__btn-cancel"
            onClick={() => {
              if (configuring !== null) {
                setConfiguring(null);
                setFeedback(null);
                return;
              }
              onClose();
            }}
          >
            {configuring !== null ? "VOLTAR" : "FECHAR"}
          </button>
        </div>
      </div>
    </div>
  );
};
