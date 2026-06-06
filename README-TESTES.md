# Testes do projeto

Este projeto usa Jest como runner unico de testes para testes unitarios,
integracao, sistema e aceitacao.

## Configuracao

- `jest.config.cjs`: configuracao principal do Jest.
- `tsconfig.test.json`: configuracao TypeScript especifica para os testes.
- `tests/setup/jest.setup.ts`: setup global com `@testing-library/jest-dom`.
- `tests/mocks/fileMock.ts`: mock simples para assets importados por componentes.
- `coverage`: saida automatica dos relatorios de cobertura, ignorada pelo Git e
  pelo ESLint.

## Estrutura

- `tests/unit`: testes unitarios de classes, funcoes e regras isoladas.
- `tests/integration`: testes de colaboracao entre classes e servicos.
- `tests/system`: fluxos maiores do jogo rodando em memoria.
- `tests/acceptance`: cenarios de comportamento esperado do produto.
- `tests/setup`: configuracao global do Jest.
- `tests/mocks`: mocks simples para assets e arquivos estaticos.

## Comandos

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:system
npm run test:acceptance
npm run test:coverage
```

Uso recomendado durante o desenvolvimento:

- Rode `npm run test:unit` quando alterar classes/funcoes pequenas.
- Rode `npm run test:integration` quando alterar regras que combinam mais de um
  modulo.
- Rode `npm run test:system` quando alterar fluxo automatico de partida.
- Rode `npm run test:acceptance` quando alterar comportamento esperado pelo
  jogador.
- Rode `npm run test:coverage` antes de entregar para atualizar os relatorios.

## Cobertura

O comando de cobertura imprime um resumo no terminal e gera relatorio HTML em:

```text
coverage/lcov-report/index.html
```

A pasta `coverage` e gerada automaticamente e nao deve ser versionada.

Onde ver a informacao de cobertura:

- Terminal: rode `npm run test:coverage` e veja a tabela impressa no final da
  execucao.
- HTML: abra `coverage/lcov-report/index.html` no navegador para navegar por
  arquivo e ver linhas cobertas/nao cobertas.
- Resumo em JSON: consulte `coverage/coverage-summary.json` quando precisar de
  um arquivo simples para registrar ou comparar numeros.
- LCOV: use `coverage/lcov.info` se alguma ferramenta externa pedir relatorio
  nesse formato.

Principais colunas do relatorio:

- `% Stmts`: porcentagem de comandos/declarações executados pelos testes.
- `% Branch`: porcentagem de caminhos condicionais cobertos, como `if`, `else`
  e operadores logicos.
- `% Funcs`: porcentagem de funcoes chamadas pelos testes.
- `% Lines`: porcentagem de linhas executadas pelos testes.
- `Uncovered Line #s`: linhas que ainda nao foram executadas por nenhum teste.

Ultima cobertura medida depois da criacao dos testes iniciais:

- Statements: `18.05%`
- Branches: `12.96%`
- Functions: `21.82%`
- Lines: `18.09%`

## Estado inicial

A estrutura comeca com 8 testes no total, sendo 2 testes de cada tipo.

## Testes unitarios

Arquivo: `tests/unit/player.test.ts`

- Verifica se o jogador inicia com o estoque oficial de pecas do Catan:
  15 estradas, 5 aldeias e 4 cidades.
- Verifica se o jogador gasta recursos apenas quando consegue pagar o custo e
  dispara erro quando nao tem recurso suficiente.

## Testes de integracao

Arquivo: `tests/integration/initial-placement.test.ts`

- Verifica se a estrada inicial so pode ser colocada conectada a aldeia recem
  posicionada.
- Verifica se a troca com o banco atualiza corretamente os recursos do jogador
  e o estoque do banco.

## Testes de sistema

Arquivo: `tests/system/bot-turn.test.ts`

- Verifica se um bot executa automaticamente a primeira acao da fase inicial.
- Verifica se um bot consegue concluir automaticamente os passos de aldeia e
  estrada no setup.

## Testes de aceitacao

Arquivo: `tests/acceptance/start-game.test.ts`

- Verifica se uma partida inicia na fase de posicionamento inicial, com jogador
  atual correto e historico iniciado.
- Verifica se o tabuleiro base possui a composicao oficial simplificada:
  19 terrenos, 18 numeros e deserto com ladrao.

## Validacao executada

Comandos executados depois da criacao da estrutura e dos 8 testes:

```bash
npm run test:unit -- --runInBand
npm run test:integration -- --runInBand
npm run test:system -- --runInBand
npm run test:acceptance -- --runInBand
npm run test:coverage -- --runInBand
npm run lint
npm run build
git diff --check
```

Resultado final:

- `8 passed`
- `0 failed`
- `npm run lint` sem erros
- `npm run build` sem erros
- `git diff --check` sem problemas de espaco em branco
