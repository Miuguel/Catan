# Cronograma — Gantt

## 1. Marcos (milestones)

| Marco | Data alvo | Entrega associada |
|-------|-----------|-------------------|
| M0 — Kickoff | [PLACEHOLDER] | Escopo inicial, definição de stack |
| M1 — 1ª entrega ES2 | [PLACEHOLDER] | Documentação + produto parcial |
| M2 — MVP jogável | [PLACEHOLDER] | Partida fim a fim com regras “lite” |
| M3 — Encerramento | [PLACEHOLDER] | Relatório final, demo, retrospectiva |

## 2. Gantt (diagrama Mermaid)

Renderiza no GitHub/GitLab em arquivos `.md`. Para **PowerPoint/PDF**, exportem via:

- [Mermaid Live Editor](https://mermaid.live) (copiar o bloco abaixo), ou
- Ferramentas como Project / Excel (importar datas manualmente a partir daqui).

```mermaid
gantt
    title Cronograma do Projeto
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section Interface Gráfica (Front-end)
    Construção do Tabuleiro 2D        :a1, 2026-04-17, 4d
    Interface do Jogador e Histórico  :a2, 2026-04-17, 5d
    Menus e Configuração              :a3, 2026-04-18, 1d

    section Motor de Regras (Back-end)
    Fluxo de Turno e Vitória          :b1, after a2, 16d
    Sistema Econômico                 :b2, after b1, 10d
    Sistema de Construção             :b3, after b2, 10d
    Gestão de Cartas                  :b4, 2026-05-19, 9d
    Mecânica do Ladrão                :b5, 2026-05-19, 5d
    Sistema de Negociação             :b6, 2026-05-19, 5d

    section Inteligência Artificial
    Tomada de Decisão e Fluxo da IA   :c1, after b3, 28d
    Lógica de Negociação da IA        :c2, after c1, 5d

    section Arquitetura de Dados
    Gestão de Estado e Integridade    :d1, 2026-07-02, 20d
    Persistência e Recuperação        :d2, after d1, 12d
```

## 3. Dependências críticas

1. Definição de **“Catan Lite”** antes de codificar regras complexas.
2. Contrato API ↔ front antes de integração pesada.
3. Ambiente de demo estável antes da avaliação.

## 4. Buffer

Incluir folga (ex.: 10–15% do cronograma) em tarefas de integração e “polimento” para demo.

---

*Ferramenta de gestão usada: [GitHub Projects / Trello / Jira / outro]: [PLACEHOLDER]*
