# Custo e orçamento

## 1. Distinção

- **Custo:** valor que efetivamente se espera gastar ou já se gastou (contabilidade do projeto).
- **Orçamento:** teto aprovado / planejado para o período (inclui contingência quando aplicável).

Em projeto acadêmico, a equipe monetiza **horas-homem** × **taxa** e discrimina itens fixos (ferramentas, infraestrutura) quando existirem.

---

## 2. Premissas de precificação

| Papel | Custo/hora (R$) | Fonte da taxa |
|-------|-----------------|---------------|
| Desenvolvimento / gestão (valor único) | 35,00 | Valor-hora definido pelo grupo |

**Conversão esforço (EAP → horas):** **1 ponto = 4 horas** de trabalho estimado.

---

## 3. Levantamento de esforço (pontos EAP)

| Pacote EAP | Story points |
|------------|--------------|
| Construção 2D (1.1.1) | 4 |
| Interface e histórico (1.1.2) | 6 |
| Menus e configuração (1.1.3) | 2 |
| Fluxo de turno e vitória (1.2.1) | 16 |
| Sistema econômico (1.2.2) | 8 |
| Sistema de construção (1.2.3) | 12 |
| Gestão de cartas (1.2.4) | 10 |
| Mecânica do ladrão (1.2.5) | 6 |
| Sistema de negociação (1.2.6) | 8 |
| Tomada de decisão e fluxo da IA (1.3.1) | 22 |
| Lógica de negociação da IA (1.3.2) | 12 |
| Persistência e recuperação de dados (1.4.1) | 12 |
| Gestão de estado e integridade (1.4.2) | 18 |
| **Total de pontos EAP** | **136** |

**Cálculo de horas totais:** 136 pontos × 4 h/ponto = **544 horas** de projeto.

**Custo total de mão de obra (desenvolvimento):** 544 h × R$ 35,00/h = **R$ 19.040,00**.

---

## 4. Custos fixos (infraestrutura e ferramentas)

| Item | Valor (R$) |
|------|------------|
| Hospedagem em nuvem e banco de dados | 0,00 |
| Licenças e ferramentas (IDEs, *assets* gráficos, etc.) | 500,00 |

**Subtotal antes da contingência:** R$ 19.040,00 + R$ 0,00 + R$ 500,00 = **R$ 19.540,00**.

---

## 5. Orçamento final (com contingência)

Contingência de **10%** sobre o subtotal **R$ 19.540,00** → **R$ 1.954,00**.

| Categoria de custo | Descrição | Valor estimado (R$) |
|--------------------|-----------|---------------------|
| Mão de obra | 544 h (136 pontos EAP × 4 h/ponto × R$ 35,00/h) | 19.040,00 |
| Infraestrutura | Hospedagem em nuvem e banco de dados | 0,00 |
| Ferramentas | Licenças (IDEs, *assets* gráficos) | 500,00 |
| Contingência | Margem de segurança de 10% sobre R$ 19.540,00 | 1.954,00 |
| **Custo total** | **Orçamento final estimado do projeto** | **21.494,00** |

---

## 6. Custo real (atualizar a cada marco)

| Período | Real (R$ ou h) | Desvio | Causa |
|---------|----------------|--------|-------|
| Sprint 1 | *(preencher)* | *(preencher)* | *(preencher)* |

---

## 7. Ferramentas com custo zero (referência)

- GitHub (repositório, Actions, Issues).
- Vite, Node.js, React, TypeScript (quando aplicável ao stack).
- VS Code / Cursor.

Itens gratuitos reduzem dúvidas sobre orçamento; custos pontuais estão na linha “Ferramentas” acima.

---

*Responsável financeiro do grupo: R. Lima — versão alinhada ao levantamento EAP (136 pontos) em 07/04/2026*
