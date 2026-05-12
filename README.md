# Catan

Trabaho de ES2 2026.1 - Catan

## Requisitos

- Node.js
- npm

## Como rodar

Instale as dependências:

```bash
npm install
```

Inicie o servidor local:

```bash
npm run dev
```

Depois abra no navegador o endereço mostrado no terminal. Normalmente será:

```text
http://localhost:5173/
```

## Scripts úteis

Rodar em modo desenvolvimento:

```bash
npm run dev
```

Gerar build:

```bash
npm run build
```

## Estratégia de ramificação

O projeto usa **GitHub Flow** como estratégia de ramificação:

1. A branch `main` deve ter sempre uma versão estável.
2. Cada tarefa deve ser feita em uma branch criada a partir da `main`.
3. Ao terminar a tarefa, abrir um Pull Request para a `main`.
4. Depois da revisão, fazer o merge na `main`.

As modificações solicitadas são controladas por **GitHub Issues**. Cada alteração deve estar associada a uma issue, com a descrição do problema ou melhoria e a justificativa da modificação realizada. A integração do código acontece por meio de **Pull Requests**, com revisão/aprovação antes do merge na `main`.

Validar automaticamente os Pull Requests, executando pelo menos:

```bash
npm run build
npm run lint
```

O nome da branch vem do card/issue do GitHub Project. Ao clicar em **Create a branch** no card, o GitHub gera automaticamente uma branch usando o número e o título do card.

Exemplo: para o card **Histórico de ações #9**, a branch gerada fica parecida com:

```text
9-historico-de-acoes
```

Depois disso, basta trazer a branch para o ambiente local:

```bash
git checkout main
git pull origin main
git fetch origin
git switch --track origin/9-historico-de-acoes
```

O padrão usado é:

```text
numero-do-card-titulo-do-card
```

Depois de alterar o código:

```bash
npm run build
npm run lint
git add .
git commit -m "feat: adiciona historico de acoes"
git push -u origin 9-historico-de-acoes
```

Use nomes de branch curtos, em minusculas, sem acentos e separados por hifen, por exemplo:

```text
10-distribuir-recursos
11-melhorar-hud
12-corrigir-build
```

## Estrutura

- `src/components`: telas e componentes de interface.
- `src/core`: regras, estado da partida, tabuleiro e jogadores.
- `src/input`: controle de interação com o canvas.
- `src/render`: desenho do tabuleiro.
- `src/styles`: estilos da aplicação.
- `docs`: documentação do projeto e requisitos.
