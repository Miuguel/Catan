# Estrutura de testes

Este projeto usa Jest para testes e relatorios simples de cobertura.

## Pastas

- `unit`: testes pequenos de classes, funcoes e regras isoladas.
- `integration`: testes com mais de uma classe/servico trabalhando juntos.
- `system`: fluxos maiores do jogo em memoria, sem depender de servidor ou banco.
- `acceptance`: cenarios escritos perto do comportamento esperado pelo usuario.
- `mocks`: arquivos falsos para assets importados em componentes.
- `setup`: configuracao global do ambiente de teste.

## Comandos

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:system
npm run test:acceptance
npm run test:coverage
```

O relatorio HTML de cobertura fica em `coverage/lcov-report/index.html`.
