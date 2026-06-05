import React from "react";
import "../styles/trade-modal.css";

export interface RobberVictimOption {
  id: string;
  name: string;
  resourceCount: number;
  avatarSrc?: string;
}

interface RobberVictimModalProps {
  isOpen: boolean;
  victims: RobberVictimOption[];
  onPick: (victimId: string) => void;
}

export const RobberVictimModal: React.FC<RobberVictimModalProps> = ({
  isOpen,
  victims,
  onPick,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="trade-modal-overlay">
      <div className="trade-modal">
        <div className="trade-modal__header">
          <h2>ESCOLHA QUEM ROUBAR</h2>
        </div>

        <div className="trade-modal__content" style={{ display: "block" }}>
          <p style={{ color: "#cbd5e1", margin: "0 0 12px" }}>
            Há mais de um adversário neste hexágono. Escolha de quem roubar 1
            recurso (aleatório).
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {victims.map((victim) => (
              <button
                key={victim.id}
                className="trade-modal__btn-submit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
                onClick={() => onPick(victim.id)}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {victim.avatarSrc && (
                    <img
                      src={victim.avatarSrc}
                      alt={victim.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {victim.name}
                </span>
                <span style={{ fontSize: 13 }}>
                  {victim.resourceCount} carta(s)
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
