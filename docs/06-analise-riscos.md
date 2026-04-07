# Análise de riscos

## 1. Legenda — probabilidade (P) e impacto (I)

Escala sugerida **1–5** (ajustar com o professor).

| Nível | Probabilidade | Impacto |
|-------|---------------|---------|
| 1 | Rara (&lt;10%) | Insignificante |
| 2 | Improvável | Baixo |
| 3 | Possível | Médio |
| 4 | Provável | Alto |
| 5 | Quase certa | Crítico |

**Prioridade:** \( P \times I \) (ou matriz qualitatica Baixa/Média/Alta).

## 2. Registro de riscos

| ID | Risco | Categoria | P | I | Exposição (P×I) | Prioridade |
|----|-------|-----------|---|---|-----------------|------------|
| R01 | Escopo do jogo real maior que o tempo da disciplina | Escopo | 4 | 5 | 20 | Alta |
| R02 | Falta de alinhamento entre membros (requisitos) | Pessoas | 3 | 4 | 12 | Média |
| R03 | Dificuldade com tempo real (WebSocket) | Técnico | 3 | 4 | 12 | Média |
| R04 | Problemas de integração front/back | Técnico | 4 | 3 | 12 | Média |
| R05 | Indisponibilidade de membro em sprint crítico | Pessoas | 3 | 3 | 9 | Média |
| R06 | Professor altera critérios de avaliação | Externo | 2 | 4 | 8 | Média |
| R07 | Ambiente de deploy instável na demo | Operacional | 3 | 3 | 9 | Média |

*Atualizem P/I com a realidade da equipe a cada revisão semanal.*

## 3. Planos de contenção (antes do evento)

| ID | Contenção |
|----|-----------|
| R01 | Definir “Catan Lite” por escrito; priorizar MVP; cortar features com acordo registrado |
| R02 | Reuniões curtas semanais; definição de “Definition of Done”; uso de issues atribuídas |
| R03 | Começar com REST + polling ou turnos assíncronos; WebSocket como incremento |
| R04 | Contrato OpenAPI cedo; mocks no front; integração contínua |
| R05 | Documentação no repositório; pareamento em tarefas críticas |
| R06 | Checklist explícito com rubrica do professor; dúvidas por e-mail |
| R07 | Demo local gravada em vídeo como plano B |

## 4. Planos de contingência (depois que o risco ocorre)

| ID | Contingência |
|----|--------------|
| R01 | Reduzir para demo com mapa fixo e 2 jogadores apenas |
| R03 | Remover tempo real; refresh manual da tela |
| R04 | Congelar escopo da sprint; focar em fluxo mínimo demonstrável |
| R07 | Apresentar laptop offline com Docker Compose |

## 5. Matriz visual (texto)

```
Impacto
  5 |     | R01 | 
  4 |     |     | R02,R03,R06
  3 | R04,R07 | R05 |
  2 |     |     |
  1 |     |     |
    +----------------
      1   2   3   4   5   Probabilidade
```

## 6. Responsáveis pelo monitoramento

| Frequência | Atividade | Responsável |
|------------|-----------|-------------|
| Semanal | Revisar top 5 riscos na retrospectiva | R. Lima |
| Por sprint | Atualizar probabilidade se contexto mudar | M. Azevedo |

---

*Versão: 1.1 (07/04/2026)*
