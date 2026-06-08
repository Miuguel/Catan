# Relatório de Cobertura de Testes — Catan

**Data:** 2026-06-07  
**Comando:** `npm run test:coverage -- --runInBand`  
**Meta solicitada:** ≥ 75% de cobertura  
**Resultado:** **79,57%** de linhas (meta atingida)

---

## Resumo executivo

| Métrica | Coberto | Total | Percentual | Meta (75%) |
|---|---:|---:|---:|:---:|
| **Linhas** | 1.297 | 1.630 | **79,57%** | ✅ |
| **Statements** | 1.327 | 1.679 | **79,03%** | ✅ |
| **Funções** | 306 | 399 | **76,69%** | ✅ |
| **Branches** | 580 | 899 | **64,51%** | ⚠️ abaixo |

**Suíte de testes:** 28 arquivos, **214 testes passando**, 1 ignorado, 0 falhas.

---

## Arquivos de relatório gerados

| Arquivo | Descrição |
|---|---|
| `coverage/lcov-report/index.html` | Relatório HTML interativo (abrir no navegador) |
| `coverage/coverage-summary.json` | Resumo numérico em JSON |
| `coverage/lcov.info` | Formato LCOV para ferramentas externas (CI, SonarQube, etc.) |
| `tests/reports/RELATORIO-COBERTURA.md` | Este documento |

---

## Cobertura por área

| Área | Linhas | Statements | Funções | Branches |
|---|---:|---:|---:|---:|
| **Projeto (total)** | **79,57%** | 79,03% | 76,69% | 64,51% |
| `src/core/game` | 84,29% | 84,02% | 91,76% | 68,32% |
| `src/core/board` | 94,63% | 94,81% | 97,40% | 87,61% |
| `src/render` | 88,38% | 88,50% | 100% | 61,22% |
| `src/components` | 56,50% | 56,41% | 43,65% | 37,82% |
| `src/App.tsx` | 73,68% | 63,63% | 14,28% | 68,75% |

---

## Destaques por arquivo

### Alta cobertura (≥ 85%)

| Arquivo | Linhas |
|---|---:|
| `GameState.ts` | 86,00% |
| `Player.ts` | 98,61% |
| `Board.ts` | 94,66% |
| `ConstructionRules.ts` | 75,20% |
| `BoardRenderer.ts` | 88,38% |
| `RobberVictimModal.tsx` | 100% |
| `TradeService.ts` | 100% |
| `ResourceNames.ts` | 100% |
| `DevelopmentCard.ts` | 100% |

### Baixa cobertura — oportunidades futuras

| Arquivo | Linhas | Motivo |
|---|---:|---|
| `Dice.tsx` | 40,27% | Animações e estados visuais do dado |
| `TradeModal.tsx` | 47,16% | Fluxos de troca entre jogadores |
| `PlayerSelection.tsx` | 50,00% | Formulário de seleção de jogadores |
| `DiscardModal.tsx` | 48,38% | Interações de descarte manual |
| `ResourceDistributionService.ts` | 64,06% | Distribuição após rolagem de dados |

### Excluídos do cálculo (configuração Jest)

Estes arquivos dependem fortemente de canvas, áudio ou UI complexa e estão fora do escopo atual:

- `src/components/Game.tsx`
- `src/components/DevelopmentCardsModal.tsx`
- `src/input/GameInputController.ts`
- `src/core/game/BotController.ts`

---

## Novos testes adicionados nesta sessão

| Arquivo de teste | Foco |
|---|---|
| `tests/unit/game-state-flow.test.ts` | Fluxo completo: setup, dados, trocas, cartas, descarte do 7, ladrão, pontuação |
| `tests/unit/player-advanced.test.ts` | Recursos, cartas de desenvolvimento, descarte, peças |
| `tests/unit/board-advanced.test.ts` | Geometria do tabuleiro, portos, detecção de cliques |
| `tests/unit/construction-rules-full.test.ts` | Regras de construção, upgrade, mensagens de erro |
| `tests/unit/robber-victim-modal.test.tsx` | Modal de escolha de vítima do ladrão |
| `tests/unit/development-cards-modal.test.tsx` | Corrigido (estava com erros de sintaxe) |

---

## Estrutura da pasta `tests/`

```
tests/
├── acceptance/     # Cenários de aceitação do produto
├── integration/    # Colaboração entre módulos
├── system/         # Fluxos completos em memória
├── unit/           # Testes unitários (maioria dos novos testes)
├── setup/          # Configuração global do Jest
├── mocks/          # Mocks de assets estáticos
└── reports/        # Relatórios de cobertura (este arquivo)
```

---

## Como reproduzir

```bash
# Todos os testes com cobertura
npm run test:coverage

# Por categoria
npm run test:unit
npm run test:integration
npm run test:system
npm run test:acceptance

# Abrir relatório HTML (Windows)
start coverage/lcov-report/index.html
```

---

## Conclusão

A meta de **75% de cobertura de linhas foi superada** com **79,57%**. O núcleo do jogo (`GameState`, `Player`, `Board`, `ConstructionRules`) está bem testado. Os maiores ganhos futuros viriam de componentes React de UI (`TradeModal`, `PlayerSelection`, `Dice`) e do `ResourceDistributionService`.

Para incluir os arquivos atualmente excluídos no relatório, remova as entradas correspondentes em `collectCoverageFrom` no arquivo `jest.config.cjs`.
