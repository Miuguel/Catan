export type DevelopmentCardType =
  | "knight"
  | "victory-point"
  | "monopoly"
  | "year-of-plenty"
  | "road-building";

export interface DevelopmentCard {
  type: DevelopmentCardType;
  /** Número do turno (rodada) em que a carta foi comprada. */
  purchasedTurn: number;
}

export const DEVELOPMENT_CARD_NAMES: Record<DevelopmentCardType, string> = {
  knight: "Cavaleiro",
  "victory-point": "Ponto de Vitória",
  monopoly: "Monopólio",
  "year-of-plenty": "Ano de Fartura",
  "road-building": "Construção de Estradas",
};

/** Cartas que o jogador escolhe jogar (a de Ponto de Vitória conta sozinha). */
export const PLAYABLE_CARD_TYPES: DevelopmentCardType[] = [
  "knight",
  "monopoly",
  "year-of-plenty",
  "road-building",
];

const DECK_COMPOSITION: Record<DevelopmentCardType, number> = {
  knight: 14,
  "victory-point": 5,
  monopoly: 2,
  "year-of-plenty": 2,
  "road-building": 2,
};

export function createDevelopmentDeck(): DevelopmentCardType[] {
  const deck: DevelopmentCardType[] = [];

  (Object.keys(DECK_COMPOSITION) as DevelopmentCardType[]).forEach((type) => {
    for (let count = 0; count < DECK_COMPOSITION[type]; count += 1) {
      deck.push(type);
    }
  });

  // Embaralhamento Fisher-Yates.
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = deck[index];
    deck[index] = deck[randomIndex];
    deck[randomIndex] = temp;
  }

  return deck;
}
