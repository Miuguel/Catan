# Análise de riscos

## 1. Metodologia

- **Probabilidade (P):** expressa em percentual (0–100%), representando a chance de o risco ocorrer no período do projeto.
- **Impacto (I):** escala contínua de **0 a 1** (0 = nenhum efeito; 1 = efeito máximo no prazo, escopo ou qualidade da entrega).
- **Exposição:** \( \text{Exposição} = P \times I \) (com **P** em decimal, ex.: 40% → 0,40).
- **Priorização:** classificação qualitativa (**Alta**, **Média**, **Baixa**) a partir da exposição e do contexto do grupo.

**Observação:** revisar probabilidades e impactos nas retrospectivas semanais ou ao fim de cada sprint.

---

## 2. Lista completa de riscos e avaliação

| ID | Risco | Probabilidade | Impacto | Exposição | Prioridade |
|----|-------|---------------|---------|-----------|------------|
| R01 | O grupo não se adaptar à linguagem/framework | 40% | 0,8 | 0,32 | Alta |
| R02 | Algum integrante trancar a matéria | 10% | 1,0 | 0,10 | Média |
| R03 | Implementação das IAs ultrapassar o tempo estimado | 60% | 0,9 | 0,54 | Alta |
| R04 | Algum integrante perder o código | 5% | 1,0 | 0,05 | Baixa |
| R05 | Conflitos de merge no GitHub quebrarem o produto | 60% | 0,7 | 0,42 | Alta |
| R06 | Interpretação incorreta das regras oficiais do Catan | 30% | 0,6 | 0,18 | Média |
| R07 | Escopo do projeto crescer além do viável para o prazo | 80% | 0,8 | 0,64 | Alta |
| R08 | Bugs em mecânicas centrais do jogo | 50% | 0,9 | 0,45 | Alta |
| R09 | Falha na integração entre módulos | 40% | 0,7 | 0,28 | Média |
| R10 | Dependência excessiva de um integrante em parte crítica | 40% | 0,9 | 0,36 | Alta |
| R11 | Falha temporária de equipamento ou ambiente de desenvolvimento | 30% | 0,6 | 0,18 | Média |
| R12 | Doença ou indisponibilidade pontual de integrante | 50% | 0,5 | 0,25 | Média |

---

## 3. Cinco riscos prioritários — contenção, contingência e monitoramento

Foram selecionados **cinco riscos** para planos de **contenção** (preventivo), **contingência** (reativo) e **monitoramento** em maior detalhe, alinhados à criticidade discutida pelo grupo: **R01, R02, R03, R04 e R05**.

### R01 — O grupo não se adaptar à linguagem ou framework

| Tipo | Plano |
|------|--------|
| **Contenção** | Definir stack simples, padronizar arquitetura, criar projeto-base, convenções de código e exemplos mínimos antes do desenvolvimento principal. |
| **Contingência** | Reduzir complexidade técnica, substituir biblioteca ou framework problemático ou redistribuir tarefas para quem domina melhor a tecnologia. |
| **Monitoramento** | Verificar semanalmente bloqueios técnicos, tempo gasto em tarefas simples e quantidade de dúvidas repetidas sobre a stack. |

### R02 — Algum integrante trancar a matéria

| Tipo | Plano |
|------|--------|
| **Contenção** | Evitar concentração de conhecimento, documentar decisões, manter tarefas divididas e código sempre no repositório. |
| **Contingência** | Replanejar cronograma, redistribuir pacotes de trabalho e cortar itens menos críticos do escopo, se necessário. |
| **Monitoramento** | Acompanhar presença, participação nas reuniões, cumprimento de tarefas e sinais de afastamento ao longo das semanas. |

### R03 — Implementação das IAs ultrapassar o tempo estimado

| Tipo | Plano |
|------|--------|
| **Contenção** | Começar com IA simples baseada em regras fixas, quebrar a IA em subtarefas menores e validar primeiro o “bot funcional” antes de tentar “bot inteligente”. |
| **Contingência** | Congelar evolução da IA, manter versão mínima jogável e adiar comportamentos mais sofisticados para depois das funcionalidades centrais. |
| **Monitoramento** | Comparar semanalmente esforço real × Planning Poker, medir quantas decisões dos bots já funcionam e identificar tarefas de IA que ficaram travadas. |

### R04 — Algum integrante perder o código

| Tipo | Plano |
|------|--------|
| **Contenção** | Uso obrigatório de GitHub, commits frequentes, push diário, branches individuais e orientação mínima de fluxo de versionamento. |
| **Contingência** | Recuperar do repositório remoto, reaproveitar versão anterior estável e redistribuir a reconstrução do que não tiver sido enviado. |
| **Monitoramento** | Conferir frequência de commits/push por integrante e identificar membros que estão mantendo trabalho só localmente. |

### R05 — Conflitos de merge no GitHub quebrarem o produto

| Tipo | Plano |
|------|--------|
| **Contenção** | Adotar branch por funcionalidade, pull request, revisão antes de merge e combinar áreas de responsabilidade para reduzir edição simultânea dos mesmos arquivos. |
| **Contingência** | Reverter merge problemático, restaurar versão estável, refazer integração em partes menores e congelar merges até estabilizar. |
| **Monitoramento** | Observar quantidade de conflitos, PRs parados, merges quebrados e falhas após integração; revisão a cada reunião técnica. |

---

## 4. Demais riscos — contenção, contingência e monitoramento

| ID | Risco | Contenção | Contingência | Monitoramento |
|----|-------|-----------|----------------|---------------|
| R06 | Interpretação incorreta das regras oficiais do Catan | Validar requisitos e casos de uso com os dois integrantes que dominam o jogo; manter documento com regras e *edge cases*; revisar regras antes de codificar mecânicas críticas. | Corrigir requisitos afetados, ajustar lógica do jogo e reexecutar testes das mecânicas impactadas. | Monitorar dúvidas recorrentes sobre regras, divergências entre membros e bugs ligados ao comportamento oficial do jogo. |
| R07 | Escopo do projeto crescer além do viável para o prazo | Fixar escopo mínimo obrigatório; registrar o que é essencial e o que é extra; só aceitar novas ideias após avaliar impacto em prazo, custo e qualidade. | Congelar escopo, remover extras e priorizar entrega funcional mínima do jogo. | Revisar pedidos de mudança a cada reunião e verificar se surgiram funcionalidades não previstas na EAP ou nas atividades. |
| R08 | Bugs em mecânicas centrais do jogo | Criar testes manuais e/ou automatizados para turno, recursos, ladrão, construção, pontuação e cartas; implementar por módulos e validar cada regra antes de integrar tudo. | Corrigir primeiro as regras que impedem a partida de prosseguir; isolar funcionalidades defeituosas; priorizar estabilidade sobre melhorias secundárias. | Monitorar taxa de bugs por módulo, falhas em partidas completas e quantidade de retrabalho em regras centrais. |
| R09 | Falha na integração entre módulos | Definir contratos claros entre interface, motor de regras, IA e persistência; integrar cedo e de forma incremental, não só no fim. | Criar branch de estabilização; integrar módulo por módulo; desativar temporariamente partes não essenciais; corrigir incompatibilidades prioritárias. | Fazer *builds* integradas frequentes, testar fluxo completo do jogo e acompanhar erros que só aparecem quando os módulos se juntam. |
| R10 | Dependência excessiva de um integrante em parte crítica | Pareamento ou revisão cruzada nas partes críticas; rodízio de conhecimento; documentação curta de decisões técnicas. | Transferir responsabilidade para outro membro com apoio do material já documentado; replanejar entregas afetadas. | Acompanhar quais módulos têm só um “dono”, quem é o único que entende determinado código e onde não existe *backup* humano. |
| R11 | Falha temporária de equipamento ou ambiente de desenvolvimento | Manter tudo no GitHub, padronizar *setup* do projeto, documentar instalação e evitar dependência de máquina específica. | Outro integrante assume temporariamente a tarefa ou ajuda a reproduzir o ambiente em outra máquina. | Verificar dificuldades recorrentes de *setup*, problemas de máquina relatados e tempo de indisponibilidade por integrante. |
| R12 | Doença ou indisponibilidade pontual de integrante | Distribuir tarefas com folga; evitar entregas em cima da data limite; manter material compartilhado. | Remanejar rapidamente a atividade para outro membro ou adiar internamente tarefa secundária para preservar o caminho crítico. | Observar ausência em reuniões, atrasos pontuais e tarefas sem atualização por mais de alguns dias. |

---

## 5. Matriz visual (exposição)

Ordenação aproximada por **exposição** (maior risco no topo):

```
Exposição alta → baixa
R07 (0,64)  R03 (0,54)  R08 (0,45)  R05 (0,42)  R10 (0,36)
R01 (0,32)  R09 (0,28)  R12 (0,25)  R06/R11 (0,18)  R02 (0,10)  R04 (0,05)
```

---

## 6. Responsáveis pelo monitoramento do processo

| Frequência | Atividade | Responsável |
|------------|-----------|-------------|
| Semanal | Revisar os cinco riscos prioritários e os de maior exposição na retrospectiva | R. Lima |
| Por sprint | Atualizar probabilidade e impacto se o contexto mudar | M. Azevedo |

---

*Versão: 2.0 — 07/04/2026*
