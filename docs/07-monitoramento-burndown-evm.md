# Monitoramento e controle — Burndown e Valor Agregado

## 1. Premissas do projeto (fonte dos números)

Estes valores estão alinhados ao **Planning Poker**, **EAP** e **custo/orçamento** já documentados:

| Premissa | Valor |
|----------|--------|
| Backlog total (BAC em story points) | **136 SP** |
| Conversão esforço | **1 SP = 4 h** (544 h totais) |
| Valor hora-homem | **R$ 35,00/h** |
| Sprint | **1 semana** (5 dias úteis) |
| Velocidade inicial estimada | **24 SP/sprint** |

**Definition of Done (DoD) usada nos exemplos abaixo:** história/documento concluído, revisado em par e integrado no repositório (`main` ou branch de entrega combinada).

> Os quadros numéricos a seguir são um **modelo preenchido de forma coerente** com essas premissas, para uso na disciplina. Substitua por **medições reais** (board, planilha de horas) assim que o grupo registrar sprints de verdade.

---

## 2. Burndown — Sprint 1

**Objetivo da Sprint 1 (ilustrativo):** fechar artefatos da 1ª entrega em `docs/` (escopo, EAP, estimativas, custo, riscos, monitoramento) e alinhar repositório.

**Compromisso do sprint:** **24 SP** (igual à velocidade planejada).

**Dias úteis:** 5 (segunda a sexta).

**Linha ideal:** redução linear de 24 SP até 0 → **4,8 SP por dia** (nos números abaixo, arredondamentos por dia mantêm o total).

| Dia | Ideal restante (SP) | Real restante (SP) | Notas |
|-----|----------------------|---------------------|-------|
| 1 (início) | 24 | 24 | Planejamento do sprint e divisão de tarefas |
| 2 | 19 | 21 | Ajustes finos em escopo e EAP |
| 3 | 14 | 17 | Estimativas (Planning Poker) e revisão |
| 4 | 10 | 12 | Custo/orçamento e análise de riscos |
| 5 (fim) | 5 | 6 | Burndown/EVM e revisão final; 1 história pequena ficou para Sprint 2 |

**Resultado do exemplo:** concluídos **18 SP** no sprint; **6 SP** permanecem (carryover) — em geral por refinamento de texto e revisão cruzada. **Velocity realizada = 18 SP** (ajustar a velocidade média nas próximas sprints).

**Interpretação para apresentação:** a linha real ficou **acima** da ideal nos dias 2–4 (**causa:** revisões e alinhamento em grupo); **ação:** quebrar tarefas menores no próximo sprint e limitar escopo de “polimento” por dia.

**Gráfico:** eixo X = dia; eixo Y = trabalho restante (SP); duas linhas (ideal vs. real).

---

## 3. Valor agregado (EVM)

### 3.1 Conceitos

| Sigla | Nome | Significado |
|-------|------|-------------|
| **BAC** | Orçamento no término | Trabalho total planejado: **136 SP** |
| **PV** | Valor planejado | Quanto **deveria** estar pronto (SP acumulados) na data |
| **EV** | Valor agregado | Quanto **está** pronto e aceito pela DoD (SP acumulados) |
| **AC** | Custo real | Horas efetivamente gastas (planilha/Toggl) |

**Índices (no fim de cada período):**

- **SPI** = EV ÷ PV (**> 1** indica à frente do cronograma planejado em valor).
- **CPI** ≈ (EV × 4 h/SP) ÷ AC — interpretação: compara **horas “ganhas”** (1 SP = 4 h) com **horas reais gastas**. **> 1** indica melhor eficiência que o previsto.

### 3.2 Plano de valor ao longo do tempo (PV)

Com **24 SP/sprint** e **136 SP** no total, o valor planejado acumulado fecha em **6 sprints** (5 × 24 + 16 = 136):

| Sprint (semana) | Incremento planejado (SP) | PV acumulado (SP) |
|-----------------|---------------------------|-------------------|
| 1 | 24 | 24 |
| 2 | 24 | 48 |
| 3 | 24 | 72 |
| 4 | 24 | 96 |
| 5 | 24 | 120 |
| 6 | 16 | **136** |

### 3.3 Controle — exemplo numérico (EV e AC)

Valores **ilustrativos**: leve atraso no valor entregue no início; recuperação gradual. **AC** = horas reais acumuladas do grupo.

| Sprint | PV (SP) | EV (SP) | AC (h) | SPI (EV/PV) | CPI ≈ (EV×4)/AC |
|--------|---------|---------|--------|-------------|-----------------|
| 1 | 24 | 18 | 98 | 0,75 | 0,73 |
| 2 | 48 | 40 | 205 | 0,83 | 0,78 |
| 3 | 72 | 64 | 310 | 0,89 | 0,83 |
| 4 | 96 | 88 | 415 | 0,92 | 0,85 |
| 5 | 120 | 112 | 518 | 0,93 | 0,86 |
| 6 | 136 | 128 | 598 | 0,94 | 0,86 |

**Leitura exemplo (Sprint 1):** **SPI = 0,75** — até o fim da primeira semana, só **18 SP** foram concluídos dos **24 SP** planejados. **CPI ≈ 0,73** — para cada hora gasta, o grupo “ganhou” um pouco menos de trabalho validado do que o esperado pelo ritmo 1 SP = 4 h.

**Leitura exemplo (Sprint 6):** **SPI = 0,94** — pequeno atraso acumulado vs. cronograma de valor; **CPI ≈ 0,86** — eficiência melhorou com o tempo, mas ainda abaixo de 1 (vale registrar causas: curva de aprendizado, dependência de revisões).

### 3.4 Custo monetário (opcional, ligado ao orçamento)

Com **R$ 35,00/h** e **AC** em horas:

| Sprint | AC (h) | Custo real acumulado (R$) |
|--------|--------|---------------------------|
| 1 | 98 | 3.430,00 |
| 2 | 205 | 7.175,00 |
| 3 | 310 | 10.850,00 |
| 4 | 415 | 14.525,00 |
| 5 | 518 | 18.130,00 |
| 6 | 598 | 20.930,00 |

*(Valores de AC são exemplos; o teto de mão de obra planejada no orçamento é **544 h** → **R$ 19.040,00** em custo de desenvolvimento — use medições reais para comparar.)*

### 4.5 Gráfico sugerido

- Eixo X: sprint (1…6).
- Eixo Y esquerdo: **PV** e **EV** (SP acumulados).
- Opcional eixo Y direito ou segunda série normalizada: **AC** (h) ou custo (R$).

---

## 4. Definition of Done (alinha EV com qualidade)

- Artefato em `docs/` revisado por outro membro e versionado no GitHub.
- Para código (sprints futuros): merge em `main` via PR; teste ou checklist registrado.

---

## 5. Artefatos para anexar na entrega

| Artefato | Formato |
|----------|---------|
| Burndown Sprint N | PNG/PDF da planilha ou screenshot do board |
| Curva EVM | PNG do gráfico + tabela PV/EV/AC |
| Ata de retrospectiva | Markdown ou PDF |

---

## 6. Ferramenta de registro

**Sugestão:** planilha compartilhada (Google Sheets) ou **Toggl** / relatório de horas por integrante; **uma pessoa** consolida AC por sprint.

---

*Versão: 2.0 — modelo numérico alinhado a 136 SP, 24 SP/sprint e R$ 35,00/h — 07/04/2026*
