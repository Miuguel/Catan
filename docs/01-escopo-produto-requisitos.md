# Escopo do produto — requisitos

## 1. Visão geral do produto

**Produto:** aplicação web para jogar uma versão **simplificada e educacional** de jogo de colonização em tabuleiro (inspirado em Catan).

**Público:** alunos e professor da disciplina; possível demonstração em sala.

## 2. Stakeholders

| Stakeholder | Interesse |
|-------------|-----------|
| Professor / monitor | Rastreabilidade, documentação, entregas, qualidade do processo |
| Equipe de desenvolvimento | Escopo claro, priorização, critérios de aceite |
| Jogadores (usuários finais) | Partida jogável, regras coerentes, interface usável |

## 3. Personas

1. **Miguel — jogador casual:** quer criar sala e jogar com amigos sem instalar nada além do navegador.
2. **Troy — avaliador:** quer ver backlog, testes e documentação alinhados aos requisitos.

## 4. Requisitos funcionais (RF)

> Numerem e mantenham rastreabilidade com issues/commits.

| ID | Requisito funcional | Descrição |
|----|---------------------|-----------|
| RF01 | Rolar dados | O sistema deve permitir que o jogador da vez role os dados no início do seu turno. |
| RF02 | Distribuir recursos | O sistema deve calcular e distribuir os recursos correspondentes aos jogadores com base no resultado dos dados (extensão de RF01). |
| RF03 | Mover ladrão | O sistema deve obrigar o jogador a mover o ladrão para um novo hexágono e roubar uma carta de outro jogador, caso o resultado dos dados seja 7 (extensão de RF01). |
| RF04 | Construir estrutura | O sistema deve permitir ao jogador construir estradas, aldeias ou cidades no tabuleiro, seguindo as regras de posicionamento. |
| RF05 | Validar recursos | Antes de efetivar qualquer construção (estrada, aldeia ou cidade), o sistema deve validar automaticamente se o jogador possui as cartas de recursos necessárias no inventário (inclusão obrigatória de RF04). |
| RF06 | Negociar com jogadores | O sistema deve prover uma interface para que o jogador da vez proponha e realize trocas de recursos com os demais jogadores, necessitando de aceitação mútua. |
| RF07 | Negociar com o banco | O sistema deve permitir a troca de recursos diretamente com o banco (taxa padrão de 4:1 ou utilizando portos específicos com taxas menores). |
| RF08 | Comprar carta | O sistema deve permitir a compra de cartas de desenvolvimento, deduzindo os recursos correspondentes do inventário do jogador. |
| RF09 | Jogar carta | O sistema deve permitir a utilização de cartas de desenvolvimento (ex.: Cavaleiro, Invenção, Monopólio) durante o turno do jogador, conforme as regras específicas de cada carta. |
| RF10 | Passar turno | O sistema deve encerrar o turno do jogador atual e transferir o controle e a permissão de ação para o próximo jogador na ordem da mesa. |
| RF11 | Configuração inicial | O sistema deve permitir a fase inicial de posicionamento, onde cada jogador coloca 2 aldeias e 2 estradas sem custo, recebendo os recursos iniciais da segunda aldeia. |
| RF12 | Cálculo de pontuação | O sistema deve contabilizar os pontos de vitória (PV) em tempo real (aldeias = 1 PV, cidades = 2 PV, cartas de ponto de vitória). |
| RF13 | Encerramento | O sistema deve declarar um vencedor assim que um jogador atingir 10 pontos de vitória no seu próprio turno. |
| RF14 | Maior estrada | O sistema deve monitorar quem tem a sequência mais longa de estradas (mínimo 5) e atribuir os 2 PV correspondentes. |
| RF15 | Maior exército | O sistema deve monitorar quem jogou mais cartas de Cavaleiro (mínimo 3) e atribuir os 2 PV. |
| RF16 | Descarte por excesso | Se um 7 for rolado, o sistema deve verificar se algum jogador tem mais de 7 cartas na mão. Em caso positivo, o jogador deve escolher metade das cartas (arredondando para baixo) para descartar. |
| RF17 | Distância entre aldeias | O sistema deve impedir a construção de uma aldeia se houver outra estrutura a menos de dois vértices de distância. |
| RF18 | Validar conexão da estrada | O sistema deve permitir construir uma estrada apenas se ela estiver conectada a uma estrada, aldeia ou cidade do próprio jogador, e apenas se a aresta estiver livre. |
| RF19 | Validar conexão da aldeia fora da fase inicial | O sistema deve permitir construir uma aldeia fora da configuração inicial apenas se ela estiver ligada a uma estrada do próprio jogador, além de respeitar a regra da distância. |
| RF20 | Bloquear produção no hexágono com ladrão | O sistema deve impedir a geração de recursos de qualquer hexágono ocupado pelo ladrão. |
| RF21 | Produção correta por aldeia e cidade | O sistema deve distribuir 1 recurso por aldeia e 2 recursos por cidade para cada hexágono adjacente correspondente ao número sorteado. |
| RF22 | Impedir uso de carta comprada no mesmo turno | O sistema não deve permitir que uma carta de desenvolvimento comprada no turno atual seja usada no mesmo turno, exceto carta de ponto de vitória revelada para vencer. |
| RF23 | Limitar a 1 carta de desenvolvimento por turno | O sistema deve permitir que o jogador utilize no máximo 1 carta de desenvolvimento por turno. |
| RF24 | Restringir negociação aos jogadores corretos | O sistema deve permitir trocas entre jogadores apenas envolvendo o jogador da vez. Jogadores fora da vez não podem negociar entre si. |
| RF25 | Validar upgrade de aldeia para cidade | O sistema deve permitir construir uma cidade apenas como melhoria de uma aldeia já existente do mesmo jogador. |
| RF26 | Executar ordem da configuração inicial | O sistema deve conduzir a fase inicial em duas rodadas, sendo a primeira em ordem normal e a segunda em ordem inversa, concedendo ao jogador os recursos da segunda aldeia posicionada. |
| RF27 | Restringir vitória ao próprio turno | O sistema deve declarar vencedor apenas quando o jogador atingir 10 pontos em seu próprio turno. |
| RF28 | Montagem do tabuleiro | O sistema deve montar o tabuleiro de acordo com as regras oficiais do Catan, com os terrenos, números, portos, deserto e posição inicial do ladrão. |


## 5. Requisitos Não Funcionais (RNF)

Os Requisitos Não Funcionais definem o "como" o sistema deve se comportar, focando na qualidade, restrições e atributos de desempenho.


| ID | Requisito não funcional | Descrição |
|----|-------------------------|-----------|
| RNF01 | Usabilidade de interface | A interface do tabuleiro deve ser apresentada em um ambiente gráfico 2D, permitindo visualização clara das áreas, vértices, arestas e inventário dos jogadores. |
| RNF02 | Desempenho | As ações do jogo devem ser emitidas e processadas com latência mínima, garantindo sensação de jogo fluido e em tempo real. Além disso, o sistema deve responder em no máximo 2 segundos. |
| RNF03 | Regras e integridade | O sistema deve atuar como árbitro absoluto, não permitindo ou revertendo quaisquer ações ilegais (ex.: desrespeitar regra de distância mínima entre aldeias, pagar recursos errados). |
| RNF04 | Confiabilidade dos dados | As informações do jogo, bem como os dados armazenados nele, devem ser preservadas e não podem ser perdidas. |
| RNF05 | Aleatoriedade e equilíbrio | O sistema deve garantir a geração aleatória dos números nos dados e a distribuição de recursos no tabuleiro. |
| RNF06 | Consistência de estado | O sistema deve manter o estado da partida sempre consistente, sem permitir situações inválidas, como recursos negativos, construções duplicadas na mesma posição, cartas inexistentes ou pontuação incorreta. |
| RNF07 | Confidencialidade de informações | O sistema deve garantir que informações sigilosas de cada jogador, como cartas de recurso e cartas de desenvolvimento na mão, sejam visíveis apenas ao próprio jogador, exceto quando as regras exigirem revelação. |

---

*Última atualização: 07/04/2026 — responsável: M. Azevedo*
