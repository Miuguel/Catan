# Custo e orçamento

## 1. Distinção

- **Custo:** valor que efetivamente se espera gastar ou já se gastou (contabilidade do projeto).
- **Orçamento:** teto aprovado / planejado para o período (pode incluir contingência).

Em projeto acadêmico, costuma-se monetizar **horas-homem** × **taxa simbólica** ou usar **custo zero** para ferramentas (estudante) com **tabela de itens** mesmo assim — alinhamento com o professor é essencial.

## 2. Premissas de precificação (exemplo)

| Papel | Custo/hora (R$) | Fonte da taxa |
|-------|-----------------|---------------|
| Dev júnior | 35,00 | Valor-hora definido pelo grupo |
| Gestão / documentação | 35,00 | Valor-hora definido pelo grupo |

*Se o professor exigir só esforço em horas, incluam coluna “horas” e deixem custo como derivado.*

## 3. Estimativa de esforço por fase (horas)

| Fase | Horas estimadas | % do total |
|------|-----------------|------------|
| Gestão e documentação | 40 | 16% |
| Requisitos e design | 36 | 14% |
| Backend | 84 | 33% |
| Frontend | 72 | 28% |
| Testes e CI | 24 | 9% |
| **Total** | **256** | 100% |

## 4. Custo planejado (R$)

| Item | Cálculo | Valor (R$) |
|------|---------|------------|
| Mão de obra | 256 h × R$ 35,00/h | 8.960,00 |
| Infraestrutura (domínio, cloud paga, se houver) | Estimativa simbólica | 0,00 |
| Ferramentas pagas (se houver) | Estimativa simbólica | 0,00 |
| Contingência (ex.: 10%) | 10% de mão de obra | 896,00 |
| **Orçamento total** | 8.960,00 + 896,00 | **9.856,00** |

## 5. Custo real (atualizar a cada marco)

| Período | Real (R$ ou h) | Desvio | Causa |
|---------|----------------|--------|-------|
| Sprint 1 | 40 h (R$ 1.400,00) | +5 h (+R$ 175,00) | Ajustes extras na organização dos artefatos e revisão entre pares |

## 6. Ferramentas gratuitas típicas (custo R$ 0)

- GitHub (repositório, Actions, Issues).
- Vite, Node.js, React, TypeScript.
- VS Code / Cursor.

Mencionar explicitamente na apresentação reduz questionamentos sobre “orçamento zero”.

---

*Responsável financeiro do grupo: R. Lima*
