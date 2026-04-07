# Estimativas de esforço — Planning Poker

## 1. Premissas

- Escala: **story points** (Fibonacci: 1, 2, 3, 5, 8, 13, 20, 40)
- **1 sprint** = 1 semana.
- Velocidade inicial estimada = 24 pontos/sprint (ajustar após 2-3 sprints).

## Estimativa via Planning Poker

| Pacote de Trabalho | G. Caldas | I. Calixto | J. Aguiar | L. Pereira | M. Azevedo | R. Lima | V. Oliveira | Consenso(média) |
|-------------------|-----------|------------|-----------|------------|------------|---------|-------------|----------|
| 1.1.1 Construção do Tabuleiro 2D | 2 | 8 | 8 | 5 | 2 | 1 | 2 | 4 |
| 1.1.2 Interface e Histórico | 13 | 5 | 5 | 5 | 5 | 8 | 2 | 6 |
| 1.1.3 Menus e Configuração | 1 | 3 | 3 | 3 | 2 | 1 | 1 | 2 |
| 1.2.1 Fluxo de Turno e Vitória | 8 | 13 | 40 | 13 | 8 | 20 | 8 | 16 |
| 1.2.2 Sistema Econômico | 8 | 3 | 5 | 20 | 3 | 13 | 5 | 8 |
| 1.2.3 Sistema de Construção | 8 | 8 | 8 | 13 | 8 | 20 | 20 | 12 |
| 1.2.4 Gestão de Cartas | 13 | 13 | 8 | 8 | 5 | 13 | 8 | 10 |
| 1.2.5 Mecânica do Ladrão | 8 | 5 | 5 | 5 | 8 | 5 | 5 | 6 |
| 1.2.6 Sistema de Negociação | 5 | 5 | 8 | 8 | 20 | 5 | 5 | 8 |
| 1.3.1 Tomada de Decisão e Fluxo da IA | 13 | 20 | 40 | 20 | 5 | 13 | 40 | 22 |
| 1.3.2 Lógica de Negociação da IA | 2 | 3 | 5 | 13 | 40 | 20 | 2 | 12 |
| 1.4.1 Persistência e Recuperação de Dados | 13 | 13 | 8 | 13 | 13 | 13 | 13 | 12 |
| 1.4.2 Gestão de Estado e Integridade | 5 | 20 | 13 | 40 | 13 | 13 | 20 | 18 |

### Divergências significativas

| História | Menor estimativa | Maior estimativa | Motivo da diferença | Acordo final |
|----------|------------------|------------------|---------------------|--------------|
| US-05 | 5 | 13 | Complexidade do mapa dinâmico vs. mapa inicial fixo | Definir MVP com mapa fixo na Sprint 1 e evoluir para variação controlada depois |

---

*Versão: 1.1 — atualizado por M. Azevedo em 07/04/2026*
