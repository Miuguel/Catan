# Documentação do projeto (1ª entrega)

Índice dos artefatos e **guia para colaboradores** usarem este repositório no GitHub.

## Índice dos documentos

| Documento | Conteúdo |
|-----------|----------|
| [01-escopo-produto-requisitos.md](01-escopo-produto-requisitos.md) | Visão, personas, requisitos funcionais/não funcionais |
| [02-eap-wbs.md](02-eap-wbs.md) | EAP / WBS do projeto |
| [03-planning-poker-estimativas.md](03-planning-poker-estimativas.md) | Histórias, planning poker, esforço |
| [04-custo-orcamento.md](04-custo-orcamento.md) | Custo, orçamento, premissas |
| [05-cronograma-gantt.md](05-cronograma-gantt.md) | Fases, Gantt (Mermaid), marcos |
| [06-analise-riscos.md](06-analise-riscos.md) | Matriz probabilidade × impacto, planos |
| [07-monitoramento-burndown-evm.md](07-monitoramento-burndown-evm.md) | Burndown por sprint, valor agregado |

Preencham datas, nomes da equipe e valores reais onde estiver `[PLACEHOLDER]`.

---

## Guia para colaboradores (GitHub e alterações)

### 2. Obter o projeto no seu computador (clone)

1. Instale o [Git](https://git-scm.com/downloads) se ainda não tiver.
2. No GitHub, abra o repositório e copie a URL (**Code** → HTTPS ou SSH).
3. No terminal (PowerShell, CMD ou Git Bash):

```bash
cd Desktop
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

Substitua pela URL real do repositório da equipe.

### 3. Fluxo recomendado: branch → alterar → commit → push → Pull Request

Evitem todos editarem direto na branch principal (`main` ou `master`) sem revisão.

1. **Atualize** a cópia local:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Crie uma branch** para sua tarefa (ex.: documento ou seção):
   ```bash
   git checkout -b docs/atualiza-cronograma
   ```
3. **Edite** os arquivos em `docs/` (editores de texto, VS Code, Cursor, etc.).
4. **Veja o que mudou**:
   ```bash
   git status
   git diff
   ```
5. **Adicione** só o que faz parte da alteração:
   ```bash
   git add docs/05-cronograma-gantt.md
   ```
6. **Commit** com mensagem clara:
   ```bash
   git commit -m "docs: atualiza marcos e datas no cronograma"
   ```
7. **Envie** a branch para o GitHub:
   ```bash
   git push -u origin docs/atualiza-cronograma
   ```
8. No site do GitHub, abra um **Pull Request** da sua branch para `main`, descreva o que mudou e **marque um colega para revisar** antes de mesclar (**Merge**).

Convenção simples de mensagens: prefixo `docs:` para mudanças só em documentação; `fix:` para correção; `chore:` para ajustes gerais.

### 4. Se o repositório ainda não existir no GitHub (primeiro envio)

Quem criou o repositório **vazio** no site faz o primeiro push a partir da pasta do projeto (já com o Git inicializado localmente):

```bash
cd caminho/para/Catan
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```


### 5. Conflitos e trabalho em paralelo

- Se duas pessoas editarem o **mesmo arquivo**, o Git pode pedir **merge**. Atualize a `main` com `git pull` antes de começar, e comuniquem no grupo quem está mexendo em qual `.md`.
- Para artefatos grandes, **dividam por arquivo** ou por seções com aviso no grupo.

### 6. O que está versionado nesta fase

- Pasta **`docs/`**: documentos da entrega (Markdown).
- Pastas **`backend/`** e **`frontend/`**: apenas reservadas (arquivo vazio `.gitkeep`); o código da aplicação ainda **não** entra neste fluxo até a equipe decidir e ajustar o `.gitignore`.

Arquivos fora desse escopo (por exemplo anotações locais em `decisoes/` ou cópias de código) **não** são enviados ao remoto enquanto essa política estiver ativa.

### 7. Dúvidas rápidas

| Situação | O que fazer |
|----------|-------------|
| Não tenho acesso | Peça ao dono do repo para adicionar você em **Settings → Collaborators**. |
| Erro “permission denied” no push | Confirme login no GitHub; em HTTPS pode usar **Personal Access Token** em vez da senha. |
| Quero desfazer antes do commit | `git restore arquivo.md` (Git recente) ou `git checkout -- arquivo.md`. |
