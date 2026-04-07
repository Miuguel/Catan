# Escopo do projeto — EAP (WBS)

## 1. Regra da EAP

- 100% do trabalho planejado deve caber na EAP (nem falta nem sobra em relação ao escopo combinado).
- Códigos da EAP facilitam referência em cronograma e custos (ex.: `1.2.3`).

## 2. EAP

```
1. Projeto Catan
├── 1.1 Interface gráfica (frontend)
│   ├── 1.1.1 Construção do tabuleiro 2D
│   ├── 1.1.2 Interface e histórico
│   └── 1.1.3 Menus e configuração
├── 1.2 Motor de regras (backend)
│   ├── 1.2.1 Fluxo de turno e vitória
│   ├── 1.2.2 Sistema econômico
│   ├── 1.2.3 Sistema de construção
│   ├── 1.2.4 Gestão de cartas
│   ├── 1.2.5 Mecânica do ladrão
│   └── 1.2.6 Sistema de negociação
├── 1.3 Inteligência artificial
│   ├── 1.3.1 Tomada de decisão e fluxo da IA
│   └── 1.3.2 Lógica de negociação da IA
└── 1.4 Arquitetura e dados
    ├── 1.4.1 Persistência e recuperação de dados
    └── 1.4.2 Gestão de estado e integridade
```

## 3. Dicionário da EAP (opcional, recomendado)

| Código | Nome | Entregável associado |
|--------|------|----------------------|
| 1.1.1 | Construção do tabuleiro 2D | Protótipo navegável + tela principal |
| 1.1.2 | Interface e histórico | Registro de turnos e ações exibido em UI |
| 1.2.1 | Fluxo de turno e vitória | Regras de passagem de turno e condição de vitória |
| 1.2.4 | Gestão de cartas | Rotinas de compra/uso de cartas + validações |
| 1.4.1 | Persistência e recuperação de dados | Modelo de dados + estratégia de salvamento |

---

*Equipe: G. Caldas, I. Calixto, J. Aguiar, L. Pereira, M. Azevedo, R. Lima, V. Oliveira — versão: 1.1 (07/04/2026)*
