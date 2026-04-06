# Monitoramento e controle — Burndown e Valor Agregado

## 1. O que o professor costuma querer ver

- **Burndown por sprint:** trabalho restante (story points ou tarefas) **dia a dia** ao longo do sprint.
- **Valor agregado (EVM):** curva planejada vs. real de valor entregue (PV, EV, AC) — mesmo que simplificado.

## 2. Burndown — como produzir

### Dados necessários

- Backlog da sprint com **tarefas estimadas** (horas ou pontos).
- Registro diário do **restante** (não só “feito”).

### Ferramentas

- **GitHub Projects** com campos de sprint + export manual para planilha.
- **Excel / Google Sheets:** coluna Dia, Restante ideal, Restante real.
- **Azure DevOps / Jira:** burndown automático se usarem sprints formais.

### Modelo de tabela (exemplo)

| Dia | Ideal restante (SP) | Real restante (SP) | Notas |
|-----|----------------------|---------------------|-------|
| 1 | 20 | 20 | Início sprint |
| 2 | 16 | 18 | Atraso por bloqueio em [X] |
| ... | ... | ... | |
| 10 | 0 | 2 | Carryover para próxima sprint |

**Gráfico:** eixo X = dias, eixo Y = restante; duas linhas (ideal vs. real).

### O que escrever na apresentação

- Se a linha real ficou acima do ideal: **causa** e **ação** (ex.: quebrar histórias menores).
- **Velocity** do sprint = pontos concluídos.

## 3. Valor agregado (EVM) — versão acadêmica simplificada

### Conceitos

- **BAC** (Budget at Completion): trabalho total planejado do projeto (ex.: 800 h ou 100 SP).
- **PV** (Planned Value): quanto **deveria** estar pronto até a data.
- **EV** (Earned Value): quanto **está** pronto de fato (validado).
- **AC** (Actual Cost): esforço gasto (horas reais).

### Índices úteis

- **CPI** = EV / AC (&gt;1 bom custo).
- **SPI** = EV / PV (&gt;1 bom prazo).

### Exemplo numérico (preencher com dados reais)

| Semana | PV (SP) | EV (SP) | AC (h) |
|--------|---------|---------|--------|
| 1 | 10 | 8 | 40 |
| 2 | 20 | 18 | 85 |

Interpretação exemplo: na semana 2, **SPI = 18/20 = 0,9** (ligeiro atraso no valor entregue vs. planejado).

### Gráfico sugerido

- Eixo X: tempo (semanas ou sprints).
- Eixo Y: valor acumulado.
- Três linhas: **PV**, **EV**, **AC** (se AC em horas, usar eixo secundário ou normalizar).

## 4. Definition of Done (alinha EV com qualidade)

Sugestão mínima:

- Código em `main` via PR revisado.
- Testes ou checklist manual documentado para a história.
- Documentação atualizada se afetar API ou setup.

## 5. Artefatos para anexar na entrega

| Artefato | Formato |
|----------|---------|
| Burndown Sprint N | PNG/PDF da planilha ou screenshot do board |
| Curva EVM | PNG do gráfico + tabela PV/EV/AC |
| Ata de retrospectiva | Markdown ou PDF |

---

*Ferramenta de registro de horas (Toggl, planilha, etc.): [PLACEHOLDER]*
