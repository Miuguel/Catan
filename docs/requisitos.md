# Requisitos Funcionais e Não Funcionais

Baseado na proposta de um jogo no estilo Colonist.io.

## Requisitos Funcionais

### RF01 - Rolar Dados

O sistema deve permitir que o jogador da vez jogue os dados no início de seu turno.

### RF02 - Distribuir Recursos

O sistema deve calcular e distribuir os recursos correspondentes aos jogadores com base no resultado dos dados.

### RF03 - Mover Ladrão

O sistema deve obrigar o jogador a mover o ladrão para um novo hexágono e roubar uma carta de outro jogador quando o resultado dos dados for 7.

### RF04 - Construir Estrutura

O sistema deve permitir ao jogador construir estradas, aldeias ou cidades no tabuleiro, seguindo as regras de posicionamento.

### RF05 - Validar Recursos

Antes de efetivar qualquer construção, o sistema deve validar automaticamente se o jogador possui os recursos necessários no inventário.

### RF06 - Negociação com Jogadores

O sistema deve prover uma interface para o jogador propor e realizar trocas de recursos com os demais jogadores, mediante aceitação mútua.

### RF07 - Negociação com Banco

O sistema deve permitir a troca de recursos diretamente com o banco, usando taxa padrão de 4:1 ou portos específicos com taxas menores.

### RF08 - Comprar Carta de Desenvolvimento

O sistema deve permitir a compra de cartas de desenvolvimento, deduzindo os recursos correspondentes do inventário do jogador.

### RF09 - Jogar Carta de Desenvolvimento

O sistema deve permitir a utilização de cartas de desenvolvimento, respeitando as regras específicas de cada carta durante o turno do jogador.

### RF10 - Passar Turno

O sistema deve encerrar o turno do jogador atual e transferir o controle e a permissão de ação para o próximo jogador na ordem da mesa.

### RF11 - Configuração Inicial

O sistema deve permitir a fase inicial de posicionamento, onde cada jogador posiciona 2 aldeias e 2 estradas sem custo, recebendo os recursos iniciais da segunda aldeia.

### RF12 - Cálculo de Pontuação

O sistema deve contabilizar os pontos de vitória em tempo real, considerando aldeias, cidades e cartas de ponto de vitória.

### RF13 - Encerramento

O sistema deve declarar um vencedor assim que um jogador atingir 10 pontos de vitória no seu próprio turno.

### RF14 - Maior Estrada

O sistema deve monitorar quem tem a sequência mais longa de estradas, com mínimo de 5, e atribuir os 2 pontos correspondentes.

### RF15 - Maior Exército

O sistema deve monitorar quem jogou mais cartas de Cavaleiro, com mínimo de 3, e atribuir os 2 pontos correspondentes.

### RF16 - Descarte por Excesso

Caso um 7 seja jogado, o sistema deve verificar se algum jogador tem mais de 7 cartas na mão e, nesse caso, obrigá-lo a descartar metade das cartas, arredondando para baixo.

### RF17 - Distância entre Aldeias

O sistema deve impedir a construção de uma aldeia se houver outra estrutura a menos de 2 vértices de distância.

### RF18 - Validar Conexão de Estrada

O sistema deve permitir construir uma estrada apenas se ela estiver conectada a uma outra estrada, aldeia ou cidade do próprio jogador, e apenas se a aresta estiver livre.

### RF19 - Validar Conexão de Aldeia fora da Fase Inicial

O sistema deve permitir construir uma aldeia fora da configuração inicial apenas se ela estiver ligada a uma estrada do próprio jogador e respeitar a regra de distância do RF17.

### RF20 - Bloquear Produção no Hexágono com Ladrão

O sistema deve impedir a geração de recursos de qualquer hexágono ocupado pelo ladrão.

### RF21 - Produção Correta por Aldeia e Cidade

O sistema deve distribuir 1 recurso por aldeia e 2 recursos por cidade para cada hexágono adjacente ao número sorteado.

### RF22 - Impedimento de Uso de Carta de Desenvolvimento Comprado no Mesmo Turno

O sistema não deve permitir que uma carta de desenvolvimento comprada no turno atual seja utilizada no mesmo turno, exceto pela carta de ponto de vitória revelada para vencer.

### RF23 - Limitar-se a Uma Carta de Desenvolvimento Jogada por Turno

O sistema deve permitir que o jogador utilize no máximo 1 carta de desenvolvimento por turno.

### RF24 - Restrição de Negociação aos Jogadores Corretos

O sistema deve permitir trocas apenas entre o jogador da vez e jogadores que não estão na vez, impedindo negociações entre si dos demais.

### RF25 - Validação de Melhoria de Aldeia para Cidade

O sistema deve permitir construir uma cidade apenas como melhoria de uma aldeia já existente do mesmo jogador.

### RF26 - Execução Correta da Ordem de Configuração Inicial

O sistema deve conduzir a fase inicial em duas rodadas, sendo a primeira em ordem normal e a segunda em ordem inversa, concedendo ao jogador os recursos da segunda aldeia posicionada.

### RF27 - Restringir Vitória ao Próprio Turno

O sistema deve declarar vencedor apenas quando o jogador atingir 10 pontos de vitória e concluir a vitória em seu próprio turno.

### RF28 - Montagem do Tabuleiro

O sistema deve montar o tabuleiro de acordo com as regras oficiais de Colonizadores de Catan/Settlers of Catan, com os terrenos, números, porto, deserto e posição inicial do ladrão.

## Requisitos Não Funcionais

### RNF01 - Usabilidade de Interface

A interface do tabuleiro deve ser apresentada em ambiente gráfico 2D, permitindo a visualização clara das áreas, vértices, arestas e inventário dos jogadores.

### RNF02 - Desempenho

As ações do jogo devem ser emitidas e processadas com latência mínima, garantindo a sensação de jogo fluido e em tempo real. O sistema deve responder, no máximo, em 2 segundos.

### RNF03 - Regras e Integridade

O sistema deve atuar como árbitro absoluto, não permitindo ou revertendo quaisquer ações ilegais, como desrespeitar a regra de distância mínima entre aldeias ou pagar recursos errados.

### RNF04 - Confiabilidade dos Dados

As informações do jogo, bem como os dados armazenados nele, devem ser preservadas e não podem ser perdidas.

### RNF05 - Aleatoriedade e Equilíbrio

O sistema deve garantir a geração aleatória dos números nos dados e a distribuição de recursos no tabuleiro.

### RNF06 - Consistência de Estado

O sistema deve manter o estado da partida sempre consistente, sem permitir situações inválidas, como recursos negativos, construções duplicadas na mesma posição, cartas inexistentes ou pontuação incorreta.

### RNF07 - Confidencialidade de Informações

O sistema deve garantir que informações sigilosas de cada jogador, como cartas de recurso e cartas de desenvolvimento na mão, sejam visíveis apenas ao próprio jogador, exceto quando as regras exigirem o contrário.
