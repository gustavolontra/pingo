// ============================================================
// GEOGRAFIA — 7.º ANO | 3.º CICLO
// Pronto a colar em src/lib/mockData.ts
// Temas: A Terra: Estudos e Representações + Meio Natural
// ============================================================

import type { Discipline } from '@/types'

export const geografia7ano: Discipline = {
  id: 'geografia-7',
  name: 'Geografia',
  subject: 'Geografia',
  year: 7,
  color: '#10b981',
  icon: '🌍',
  totalLessons: 22,
  completedLessons: 0,
  topics: [

    // ══════════════════════════════════════════════════════
    // TÓPICO 1 — A TERRA: ESTUDOS E REPRESENTAÇÕES
    // ══════════════════════════════════════════════════════
    {
      id: 'geo7-t1',
      disciplineId: 'geografia-7',
      title: 'A Terra: Estudos e Representações',
      description: 'A paisagem, os mapas, a escala e as coordenadas geográficas — como representamos a Terra.',
      order: 1,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto — A Paisagem e a Geografia ───
        {
          id: 'geo7-t1-l1',
          topicId: 'geo7-t1',
          title: 'A Paisagem e o Estudo da Terra',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 12,
          xpReward: 45,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## A Paisagem e o Estudo da Terra

### O que é a Geografia?
A **Geografia** é a ciência que estuda a localização e a descrição dos lugares à superfície da Terra, bem como as relações entre o ser humano e o ambiente que o rodeia. O geógrafo procura responder a questões como:
- **Onde** se localiza?
- **Por que** se localiza ali?
- **Como** se distribui?
- **Que impactes** se observam?

### O que é a Paisagem?
A **paisagem** é o conjunto de elementos naturais e humanos visíveis num determinado espaço. Toda a paisagem que nos rodeia tem dois tipos de elementos:

**Elementos naturais:**
- Relevo (montanhas, planícies, vales)
- Cursos de água (rios, lagos)
- Vegetação natural
- Clima e condições atmosféricas

**Elementos humanos (antrópicos):**
- Edifícios, estradas, pontes
- Campos cultivados
- Cidades e vilas
- Infraestruturas industriais

### Tipos de Paisagem
As paisagens podem classificar-se de várias formas:

**Quanto à escala:**
- **Paisagem local** — o bairro, a vila, a cidade onde vives
- **Paisagem regional** — uma região de Portugal (ex: Alentejo, Minho)
- **Paisagem nacional** — Portugal continental e insular
- **Paisagem continental** — a Europa
- **Paisagem mundial** — o planeta Terra

**Quanto à influência humana:**
- **Paisagem natural** — pouco ou nada alterada pelo ser humano (ex: desertos remotos, florestas virgens)
- **Paisagem humanizada** — fortemente transformada pelo ser humano (ex: cidades, campos agrícolas)

### Como Observar a Paisagem
A observação da paisagem pode ser:
- **Direta** — in loco, no terreno, com os próprios olhos ou com esboços
- **Indireta** — através de mapas, fotografias aéreas, imagens de satélite, vídeos

> **Conceitos chave:** paisagem, elemento natural, elemento humano, escala geográfica, observação direta, observação indireta`,
            keyPoints: [
              'A Geografia estuda a localização dos lugares e as relações entre o ser humano e o ambiente.',
              'A paisagem é o conjunto de elementos naturais (relevo, rios, vegetação) e humanos (edifícios, estradas) visíveis num espaço.',
              'As paisagens existem a várias escalas: local, regional, nacional, continental e mundial.',
              'A observação pode ser direta (no terreno) ou indireta (mapas, satélite, fotos aéreas).',
            ],
          },
        },

        // ── Lição 2: Texto — Os Mapas ───────────────────
        {
          id: 'geo7-t1-l2',
          topicId: 'geo7-t1',
          title: 'Os Mapas — Representar a Terra',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 18,
          xpReward: 55,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## Os Mapas — Representar a Terra

### O que é um Mapa?
Um **mapa** é uma representação plana, reduzida e simplificada de toda ou parte da superfície terrestre. Os mapas são a ferramenta mais importante da Geografia.

**Vantagens dos mapas:**
- Práticos, fáceis de transportar e de usar
- Representam a totalidade ou apenas parte da Terra

**Desvantagens:**
- A representação é distorcida — é impossível representar uma esfera (a Terra) numa superfície plana sem distorções

### Formas de Representar a Terra
| Forma | Descrição | Vantagens | Desvantagens |
|-------|-----------|-----------|--------------|
| **Globo** | Esfera que representa a Terra | Representação fiel, sem distorções | Pouco prático, difícil transporte |
| **Planisfério** | Mapa plano de toda a Terra | Representa o mundo inteiro | Grande distorção, especialmente nos polos |
| **Mapa** | Representa parte da superfície | Prático, pormenorizado | Distorção em grandes áreas |
| **Planta** | Representa pequenas áreas (salas, vilas) | Muito detalhada | Só serve para áreas muito pequenas |
| **Fotografia aérea** | Imagem tirada de avião | Real, atualizada | Difícil de interpretar sem treino |
| **Imagem de satélite** | Imagem tirada de satélite | Cobre grandes áreas, atualizada | Pode ter baixa resolução |

### Elementos Fundamentais de um Mapa
Todo o mapa deve ter **cinco elementos essenciais** (memoriza com a sigla TELOS):

1. **T**ítulo — indica o que o mapa representa
2. **E**scala — a relação entre o mapa e a realidade
3. **L**egenda — explica os símbolos usados no mapa
4. **O**rientação — indica onde é o Norte (geralmente com uma rosa dos ventos ou seta)
5. **F**onte — indica quem fez o mapa e quando

### Tipos de Mapas
**Mapas de base** (a partir dos quais se fazem outros):
- **Planisférios** — representam toda a Terra
- **Mapas corográficos** — representam países ou regiões
- **Mapas topográficos** — representam zonas pequenas com muitos pormenores (altitude por curvas de nível, rios, estradas)

**Mapas temáticos** (representam um tema específico):
- **Físicos** — relevo, rios, montanhas
- **Políticos** — fronteiras, países, capitais
- **Demográficos** — distribuição da população
- **Climáticos** — climas e temperaturas
- **Económicos** — agricultura, indústria, comércio

### A Escala
A **escala** é a relação entre a distância no mapa e a distância real na superfície terrestre.

**Tipos de escala:**
- **Escala numérica**: escrita como uma fração. Ex: 1:50 000 significa que 1 cm no mapa = 50 000 cm (= 500 m) na realidade
- **Escala gráfica**: representada por um segmento de reta dividido em partes iguais

**Mapas de grande escala vs pequena escala:**
- **Grande escala** (ex: 1:5 000) → área pequena, muito pormenorizada. Ex: planta de uma cidade
- **Pequena escala** (ex: 1:1 000 000) → área grande, pouco pormenorizada. Ex: mapa do mundo

> ⚠️ Atenção: Grande escala = muito pormenor = área pequena. Pequena escala = pouco pormenor = área grande.

**Fórmulas da escala:**
- Distância real = Distância no mapa × Denominador da escala
- Distância no mapa = Distância real ÷ Denominador da escala

### Projeções Cartográficas
Como a Terra é esférica, há sempre distorção ao representá-la num plano. Os diferentes métodos de "esticar" a esfera chamam-se **projeções cartográficas**:

- **Projeção cilíndrica** (ex: Mercator): usada para planisférios; distorção maior perto dos polos (a Gronelândia parece maior do que a África, o que não é verdade!)
- **Projeção cónica**: usada para representar regiões temperadas
- **Projeção azimutal**: usada para representar os polos

> **Conceitos chave:** mapa, escala, planisfério, mapa topográfico, escala numérica, escala gráfica, projeção cartográfica, legenda, orientação`,
            keyPoints: [
              'Um mapa é uma representação plana, reduzida e simplificada da superfície terrestre.',
              'Os 5 elementos de um mapa são: Título, Escala, Legenda, Orientação e Fonte (TELOF).',
              'A escala 1:50 000 significa que 1 cm no mapa = 500 m na realidade.',
              'Mapas de grande escala = muito pormenor + área pequena. Mapas de pequena escala = pouco pormenor + área grande.',
              'Há sempre distorção ao representar a Terra (esfera) num plano — as projeções cartográficas minimizam essa distorção.',
            ],
          },
        },

        // ── Lição 3: Texto — Coordenadas Geográficas ────
        {
          id: 'geo7-t1-l3',
          topicId: 'geo7-t1',
          title: 'Coordenadas Geográficas — Latitude e Longitude',
          type: 'text',
          difficulty: 'intermedio',
          estimatedMinutes: 15,
          xpReward: 55,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## Coordenadas Geográficas

### Localização Relativa vs Localização Absoluta
**Localização relativa** — descreve a posição de um lugar em relação a outros lugares. Usa-se a **rosa dos ventos** (Norte, Sul, Este, Oeste e as direções intermédias).

Ex: "Lisboa fica a sul do Porto" ou "o Brasil fica a oeste de Portugal"

**Localização absoluta** — define com exatidão a posição de qualquer ponto na Terra usando um sistema de **coordenadas geográficas**: latitude e longitude.

### Os Elementos Geométricos da Esfera Terrestre

**Círculos Máximos** — círculos imaginários que dividem a Terra em duas partes iguais (hemisférios):
- **Equador**: o maior paralelo, a 0° de latitude. Divide a Terra em Hemisfério Norte e Hemisfério Sul.
- **Meridianos**: passam pelos dois polos e dividem a Terra em hemisférios. O **Meridiano de Greenwich** (0°) divide a Terra em Hemisfério Ocidental (Oeste) e Hemisfério Oriental (Este).

**Círculos Menores** — dividem a Terra em partes desiguais:
- **Paralelos**: círculos paralelos ao Equador
- **Trópico de Câncer**: paralelo a 23°27' Norte (Hemisfério Norte)
- **Trópico de Capricórnio**: paralelo a 23°27' Sul (Hemisfério Sul)
- **Círculo Polar Ártico**: 66°33' Norte
- **Círculo Polar Antártico**: 66°33' Sul

### Latitude
A **latitude** é a distância angular ao Equador, medida em graus.
- Varia entre **0° (Equador)** e **90° Norte (Polo Norte)** e **90° Sul (Polo Sul)**
- Um lugar ao norte do Equador tem latitude Norte (ex: Lisboa ≈ 38°N)
- Um lugar ao sul do Equador tem latitude Sul (ex: São Paulo ≈ 23°S)

### Longitude
A **longitude** é a distância angular ao Meridiano de Greenwich, medida em graus.
- Varia entre **0° (Greenwich)** e **180° Este** e **180° Oeste**
- Um lugar a este de Greenwich tem longitude Este (ex: Roma ≈ 12°E)
- Um lugar a oeste de Greenwich tem longitude Oeste (ex: Nova Iorque ≈ 74°W)

### Como Ler as Coordenadas
As coordenadas de um lugar escrevem-se sempre com **latitude primeiro, longitude depois**:

Ex: Lisboa = 38°N, 9°W
Isto quer dizer: 38° ao norte do Equador, 9° a oeste de Greenwich.

### Altitude
A **altitude** é a distância vertical desde o nível médio do mar até ao lugar, medida em metros.
- Altitude 0 m = nível do mar
- Altitude positiva = acima do nível do mar (ex: Serra da Estrela: 1993 m)
- Altitude negativa (profundidade) = abaixo do nível do mar (ex: fundo do oceano)

### Tecnologias de Informação Geográfica (TIG)
As TIG são ferramentas modernas para localizar, descrever e compreender os lugares:
- **Google Earth / Google Maps** — visualização do território em 3D e em mapa
- **GPS (Global Positioning System)** — sistema de satélites que indica a posição exata de qualquer lugar
- **SIG (Sistemas de Informação Geográfica)** — software para criar e analisar mapas com múltiplas informações
- **Big Data geográfico** — dados em grande quantidade sobre o território

> **Conceitos chave:** localização relativa, localização absoluta, latitude, longitude, altitude, Equador, meridiano de Greenwich, paralelos, meridianos, TIG, SIG, GPS`,
            keyPoints: [
              'Localização relativa usa pontos de referência (norte de, a oeste de); localização absoluta usa coordenadas geográficas.',
              'Latitude = distância ao Equador (0° a 90° N ou S). Longitude = distância ao Meridiano de Greenwich (0° a 180° E ou O).',
              'O Equador divide a Terra em Hemisfério Norte e Sul; o Meridiano de Greenwich divide em Hemisfério Ocidental e Oriental.',
              'Lisboa está aproximadamente a 38°N, 9°W — 38 graus ao norte do Equador, 9 graus a oeste de Greenwich.',
              'O GPS usa satélites para determinar a posição exata de qualquer lugar na Terra.',
            ],
          },
        },

        // ── Lição 4: Flashcards ─────────────────────────
        {
          id: 'geo7-t1-l4',
          topicId: 'geo7-t1',
          title: 'Flashcards — Representação da Terra',
          type: 'flashcard',
          difficulty: 'basico',
          estimatedMinutes: 10,
          xpReward: 40,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'Quais são os 5 elementos essenciais de um mapa?', back: 'Título, Escala, Legenda, Orientação e Fonte.', example: 'Memoriza com: "Todo Estudante Lê Os Factos".' },
              { id: 'fc2', front: 'O que significa a escala 1:25 000?', back: '1 cm no mapa = 25 000 cm na realidade = 250 metros.', example: 'Um mapa 1:25 000 é de grande escala — mostra muito pormenor de uma área pequena.' },
              { id: 'fc3', front: 'O que é a latitude?', back: 'A distância angular ao Equador, em graus, entre 0° e 90° Norte ou Sul.', example: 'Portugal está entre 37° e 42° de latitude Norte.' },
              { id: 'fc4', front: 'O que é a longitude?', back: 'A distância angular ao Meridiano de Greenwich, em graus, entre 0° e 180° Este ou Oeste.', example: 'Portugal está entre 6° e 9° de longitude Oeste.' },
              { id: 'fc5', front: 'Qual a diferença entre mapa de grande escala e de pequena escala?', back: 'Grande escala = muito pormenor, área pequena. Pequena escala = pouco pormenor, área grande.', example: '1:5 000 (grande escala) vs 1:10 000 000 (pequena escala).' },
              { id: 'fc6', front: 'O que é o Equador?', back: 'O maior paralelo (círculo máximo) que divide a Terra em Hemisfério Norte e Hemisfério Sul, a 0° de latitude.', example: 'O Brasil, a África equatorial e o Oceano Índico passam pelo Equador.' },
              { id: 'fc7', front: 'O que é o Meridiano de Greenwich?', back: 'O meridiano de referência (0° de longitude) que divide a Terra em Hemisfério Ocidental e Oriental. Passa por Londres.', example: 'Portugal está a oeste do Meridiano de Greenwich — por isso tem longitude Oeste.' },
              { id: 'fc8', front: 'O que é o GPS?', back: 'Global Positioning System — sistema de satélites que determina a posição exata de qualquer ponto na Terra.', example: 'O GPS do teu telemóvel usa coordenadas geográficas para te localizar no mapa.' },
            ],
          },
        },

        // ── Lição 5: Quiz ───────────────────────────────
        {
          id: 'geo7-t1-l5',
          topicId: 'geo7-t1',
          title: 'Quiz — Representação da Terra',
          type: 'quiz',
          difficulty: 'intermedio',
          estimatedMinutes: 15,
          xpReward: 85,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Qual dos seguintes é um elemento obrigatório de um mapa?',
                type: 'multiple-choice',
                options: ['A fotografia do cartógrafo', 'A escala', 'O nome do país representado', 'A data de nascimento do autor'],
                correctAnswer: 1,
                explanation: 'A escala é um dos cinco elementos essenciais de qualquer mapa: Título, Escala, Legenda, Orientação e Fonte. Sem escala, não conseguimos saber a que distâncias reais correspondem as distâncias no mapa.',
              },
              {
                id: 'q2',
                text: 'Um mapa de escala 1:50 000 é de grande escala.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Verdadeiro. A escala 1:50 000 é de grande escala (representa uma área pequena com muito pormenor). Comparativamente, um mapa de escala 1:10 000 000 é de pequena escala (representa uma área muito grande com pouco pormenor).',
              },
              {
                id: 'q3',
                text: 'Num mapa com escala 1:25 000, a distância medida entre dois pontos é de 4 cm. Qual é a distância real?',
                type: 'multiple-choice',
                options: ['250 m', '500 m', '1 000 m', '2 500 m'],
                correctAnswer: 2,
                explanation: 'Distância real = distância no mapa × denominador da escala = 4 cm × 25 000 = 100 000 cm = 1 000 m = 1 km.',
              },
              {
                id: 'q4',
                text: 'O que é a latitude?',
                type: 'multiple-choice',
                options: [
                  'A distância ao Meridiano de Greenwich, em graus',
                  'A distância ao Equador, em graus',
                  'A altitude de um lugar em metros',
                  'A distância entre dois pontos num mapa',
                ],
                correctAnswer: 1,
                explanation: 'A latitude é a distância angular ao Equador, medida em graus. Varia entre 0° (Equador) e 90° Norte (Polo Norte) ou 90° Sul (Polo Sul).',
              },
              {
                id: 'q5',
                text: 'Portugal continental tem longitude Oeste porque fica a oeste do Meridiano de Greenwich.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. O Meridiano de Greenwich (0°) passa por Londres. Portugal fica a oeste desse meridiano, por isso tem longitude Oeste (entre 6°W e 9°W aproximadamente).',
              },
              {
                id: 'q6',
                text: 'Qual das seguintes formas representa a Terra de forma mais fiel, sem distorções?',
                type: 'multiple-choice',
                options: ['Planisfério', 'Globo terrestre', 'Mapa topográfico', 'Fotografia aérea'],
                correctAnswer: 1,
                explanation: 'O globo terrestre é a representação mais fiel da Terra porque mantém a sua forma esférica, sem as distorções inevitáveis dos mapas planos. A desvantagem é que é pouco prático.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 2 — O MEIO NATURAL: O RELEVO
    // ══════════════════════════════════════════════════════
    {
      id: 'geo7-t2',
      disciplineId: 'geografia-7',
      title: 'O Meio Natural — O Relevo',
      description: 'As formas de relevo terrestre, como se representam nos mapas e os principais relevos do Mundo.',
      order: 2,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'geo7-t2-l1',
          topicId: 'geo7-t2',
          title: 'O Relevo — Formas e Representação',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 18,
          xpReward: 55,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## O Relevo

### O que é o Relevo?
O **relevo** é o conjunto de irregularidades da superfície terrestre — o conjunto de formas que a Terra apresenta. O relevo condiciona fortemente a distribuição das populações, as atividades económicas e o clima.

### A Altitude
A **altitude** é a distância vertical, em metros, desde o nível médio do mar até a um lugar.
- **Altitude positiva**: acima do nível do mar (ex: Serra da Estrela = 1993 m)
- **Altitude zero**: ao nível do mar (praias, portos)
- **Altitude negativa (profundidade)**: abaixo do nível do mar (fundos oceânicos)

### Principais Formas de Relevo

**Planície**
- Superfície plana ou ligeiramente ondulada
- Altitude geralmente inferior a 200 metros
- Terrenos férteis, boa para agricultura
- Exemplo: Planície do Tejo (Portugal), Planície Húngara (Europa)

**Colina / Outeiro**
- Elevação suave, com cume arredondado
- Altitude entre 200 e 500 metros
- Vertentes com pouco declive

**Planalto**
- Superfície plana ou ligeiramente ondulada de **média ou grande altitude**
- Rios com vales profundos e encaixados
- Exemplo: Planalto Central Ibérico, Planalto Brasileiro

**Montanha**
- Elevação de grande altitude, com vertentes íngremes e picos elevados
- Altitude superior a 500 metros (convencionalmente)
- Exemplo: Serra da Estrela (Portugal), Alpes (Europa), Himalaias (Ásia)

**Cordilheira**
- Conjunto de montanhas alinhadas
- Exemplo: Andes (América do Sul), Himalaias (Ásia), Alpes (Europa), Pirenéus

**Vale**
- Depressão alongada entre duas elevações
- Geralmente percorrido por um rio

### As Grandes Cadeias Montanhosas do Mundo
| Cordilheira | Continente | Pico mais alto | Altitude |
|---|---|---|---|
| Himalaias | Ásia | Monte Evereste | 8 848 m |
| Andes | América do Sul | Aconcágua | 6 961 m |
| Montanhas Rochosas | América do Norte | Monte Elbert | 4 399 m |
| Alpes | Europa | Mont Blanc | 4 808 m |
| Atlas | África | Jbel Toubkal | 4 167 m |
| Pirenéus | Europa | Pico Aneto | 3 404 m |
| Serra da Estrela | Portugal | Torre | 1 993 m |

### Como se Representa o Relevo nos Mapas

**Mapa hipsométrico**: usa **cores** para representar a altitude. Normalmente:
- Azul → oceanos e mares (altitude negativa)
- Verde → baixas altitudes (planícies)
- Amarelo/Laranja → altitudes médias
- Castanho/Vermelho → altas altitudes (montanhas)
- Branco → picos muito elevados (neve permanente)

**Curvas de nível**: linhas que unem pontos com a mesma altitude. Quanto mais juntas, maior o declive; quanto mais afastadas, mais plano o terreno.

**Perfil topográfico**: corte vertical do terreno que mostra as variações de altitude ao longo de uma linha.

### Os Agentes do Relevo
O relevo é formado e modelado por dois tipos de agentes:

**Agentes internos (endógenos):**
- Movimentos tectónicos (colisão de placas que forma montanhas)
- Vulcanismo (formação de vulcões e ilhas vulcânicas)
- Sismos (abalos de terra)

**Agentes externos (exógenos):**
- Erosão pela água (rios, chuva, mar)
- Erosão pelo vento
- Erosão pelo gelo (glaciares)

> **Conceitos chave:** altitude, planície, colina, planalto, montanha, cordilheira, vale, mapa hipsométrico, curva de nível, perfil topográfico, declive`,
            keyPoints: [
              'O relevo são as irregularidades da superfície terrestre — planícies, colinas, planaltos, montanhas, cordilheiras e vales.',
              'A altitude é a distância em metros desde o nível do mar até ao lugar.',
              'Os mapas hipsométricos usam cores para representar diferentes altitudes (verde = baixo, castanho = alto).',
              'As curvas de nível unem pontos com a mesma altitude — quanto mais juntas, maior o declive.',
              'O Evereste (Himalaias, Ásia) é o pico mais alto do mundo, com 8 848 metros.',
            ],
          },
        },

        // ── Lição 2: Flashcards ─────────────────────────
        {
          id: 'geo7-t2-l2',
          topicId: 'geo7-t2',
          title: 'Flashcards — Formas de Relevo',
          type: 'flashcard',
          difficulty: 'basico',
          estimatedMinutes: 8,
          xpReward: 35,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'O que é uma planície?', back: 'Superfície plana ou ligeiramente ondulada, geralmente com menos de 200 m de altitude.', example: 'A Planície do Tejo, em Portugal, é ideal para a agricultura.' },
              { id: 'fc2', front: 'O que é um planalto?', back: 'Superfície plana ou ondulada de média/grande altitude, com rios de vales profundos.', example: 'O Planalto Central Ibérico ocupa grande parte de Espanha.' },
              { id: 'fc3', front: 'Qual é a cordilheira mais alta do mundo?', back: 'Os Himalaias, na Ásia, com o Monte Evereste a 8 848 metros.', example: 'Os Himalaias resultam da colisão entre a placa indiana e a placa euroasiática.' },
              { id: 'fc4', front: 'O que são as curvas de nível?', back: 'Linhas num mapa que unem pontos com a mesma altitude.', example: 'Curvas de nível muito juntas = terreno muito inclinado. Afastadas = terreno plano.' },
              { id: 'fc5', front: 'Qual é o ponto mais alto de Portugal continental?', back: 'A Torre, na Serra da Estrela, com 1 993 metros.', example: 'A Serra da Estrela é a única zona de Portugal com neve regular no inverno.' },
              { id: 'fc6', front: 'Qual a diferença entre montanha e cordilheira?', back: 'Montanha é uma elevação isolada. Cordilheira é um conjunto de montanhas alinhadas.', example: 'Os Pirenéus são uma cordilheira; o Monte Branco é uma montanha nos Alpes.' },
            ],
          },
        },

        // ── Lição 3: Quiz ───────────────────────────────
        {
          id: 'geo7-t2-l3',
          topicId: 'geo7-t2',
          title: 'Quiz — O Relevo',
          type: 'quiz',
          difficulty: 'basico',
          estimatedMinutes: 10,
          xpReward: 65,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Qual das seguintes formas de relevo tem altitude geralmente inferior a 200 metros e superfície plana?',
                type: 'multiple-choice',
                options: ['Montanha', 'Planalto', 'Planície', 'Cordilheira'],
                correctAnswer: 2,
                explanation: 'A planície é uma superfície plana ou ligeiramente ondulada com altitude geralmente inferior a 200 metros. São zonas muito férteis e propícias à agricultura.',
              },
              {
                id: 'q2',
                text: 'Num mapa hipsométrico, a cor verde representa normalmente as baixas altitudes.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Verdadeiro. Nos mapas hipsométricos, a convenção de cores é: azul = oceanos/profundidade, verde = planícies (baixas altitudes), amarelo/laranja = altitudes médias, castanho/vermelho = montanhas, branco = neve permanente.',
              },
              {
                id: 'q3',
                text: 'Qual é a cordilheira mais alta do mundo?',
                type: 'multiple-choice',
                options: ['Andes', 'Alpes', 'Himalaias', 'Montanhas Rochosas'],
                correctAnswer: 2,
                explanation: 'Os Himalaias, na Ásia, são a cordilheira mais alta do mundo. Contêm o Monte Evereste (8 848 m), o pico mais alto da Terra.',
              },
              {
                id: 'q4',
                text: 'O que representa um mapa com curvas de nível muito juntas?',
                type: 'multiple-choice',
                options: [
                  'Terreno plano, com pouco declive',
                  'Zona de mar profundo',
                  'Terreno muito inclinado, com grande declive',
                  'Zona de planície aluvial',
                ],
                correctAnswer: 2,
                explanation: 'Curvas de nível muito juntas significam que a altitude muda muito num espaço curto — ou seja, o terreno é muito inclinado (grande declive). Curvas afastadas = terreno plano.',
              },
              {
                id: 'q5',
                text: 'Qual é o ponto mais alto de Portugal continental?',
                type: 'multiple-choice',
                options: ['Serra de Sintra (529 m)', 'Serra de Monchique (902 m)', 'Torre — Serra da Estrela (1 993 m)', 'Pico — Açores (2 351 m)'],
                correctAnswer: 2,
                explanation: 'O ponto mais alto de Portugal continental é a Torre, na Serra da Estrela, com 1 993 metros. O pico mais alto do território português é o Pico, nos Açores, com 2 351 metros.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 3 — O MEIO NATURAL: RIOS E LITORAL
    // ══════════════════════════════════════════════════════
    {
      id: 'geo7-t3',
      disciplineId: 'geografia-7',
      title: 'Rios, Bacias Hidrográficas e Litoral',
      description: 'Os cursos de água, as bacias hidrográficas e as formas do litoral.',
      order: 3,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto — Rios ───────────────────────
        {
          id: 'geo7-t3-l1',
          topicId: 'geo7-t3',
          title: 'Os Rios e as Bacias Hidrográficas',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 18,
          xpReward: 55,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## Os Rios e as Bacias Hidrográficas

### O que é um Rio?
Um **rio** é um curso de água natural que flui de um ponto mais alto (nascente) para um ponto mais baixo (foz). Os rios são fundamentais para a vida humana: fornecem água potável, permitem a irrigação agrícola, produzem energia elétrica e servem como vias de transporte.

### Partes de um Rio
- **Nascente**: local onde o rio nasce (geralmente nas montanhas)
- **Curso superior**: zona próxima da nascente, com grande declive e muita erosão
- **Curso médio**: zona intermédia, com menor declive
- **Curso inferior**: zona próxima da foz, com pouco declive — o rio alarga e deposita sedimentos
- **Foz**: local onde o rio desagua no mar, num lago ou noutro rio
  - **Delta**: foz em leque, com depósito de sedimentos (ex: Nilo, Ganges)
  - **Estuário**: foz alargada em forma de funil, com influência das marés (ex: Tejo, Sado)
- **Afluente**: rio que desagua noutro rio (ex: o Mondego é afluente do... não é! O Zêzere é afluente do Tejo)
- **Leito**: espaço por onde flui a água
  - **Leito de estiagem**: mínimo de água (verão)
  - **Leito de inundação**: máximo de água (cheias)

### O que é o Caudal?
O **caudal** é a quantidade de água que passa por uma secção do rio por unidade de tempo (m³/s).
- **Caudal de estiagem**: mínimo de água (verão seco)
- **Caudal ecológico**: quantidade mínima de água que deve permanecer no rio para manter o ecossistema

### A Bacia Hidrográfica
A **bacia hidrográfica** é o conjunto de todas as terras que são drenadas por um rio e pelos seus afluentes. É separada de outras bacias por relevos chamados **divisores de águas** (ou linhas de cumeada).

A **rede hidrográfica** é o conjunto formado pelo rio principal e todos os seus afluentes.

### Principais Rios do Mundo
| Rio | Continente | Comprimento |
|---|---|---|
| Nilo | África | 6 695 km |
| Amazonas | América do Sul | 6 516 km |
| Yangtzé | Ásia | 6 380 km |
| Mississípi | América do Norte | 6 275 km |
| Volga | Europa | 3 692 km |

### Principais Rios de Portugal
Os rios portugueses nascem maioritariamente em Espanha e desaguam no Oceano Atlântico:
- **Tejo** — o mais longo (1 007 km), nasce em Espanha, foz em Lisboa (estuário)
- **Douro** — 927 km, nasce em Espanha, foz no Porto
- **Guadiana** — 810 km, faz fronteira com Espanha
- **Minho** — faz fronteira com Espanha ao norte
- **Mondego** — o maior rio completamente português (234 km)

### Os Recursos Hídricos
A água é um recurso natural essencial e cada vez mais escasso. As principais ameaças são:
- Consumo excessivo (agricultura, indústria, uso doméstico)
- Poluição dos cursos de água
- Desflorestação (reduz a infiltração de água no solo)
- Alterações climáticas (secas mais frequentes)

A gestão responsável dos recursos hídricos é fundamental para o futuro.

### A Toalha Freática (ou Aquífera)
A **toalha freática** é a água que se encontra acumulada no subsolo, nos poros das rochas. É uma reserva de água subterrânea importantíssima, que abastece poços, nascentes e furos artesianos.

> **Conceitos chave:** nascente, foz, afluente, bacia hidrográfica, rede hidrográfica, caudal, leito, planície aluvial, erosão fluvial, toalha freática`,
            keyPoints: [
              'Um rio nasce na nascente e desagua na foz — que pode ser em delta (leque) ou em estuário (funil).',
              'A bacia hidrográfica é todo o território drenado por um rio e os seus afluentes.',
              'O caudal é a quantidade de água que passa por uma secção do rio por unidade de tempo.',
              'O Tejo é o rio mais longo de Portugal (e da Península Ibérica), com 1 007 km.',
              'O Mondego é o maior rio completamente português, com 234 km.',
            ],
          },
        },

        // ── Lição 2: Texto — Litoral ────────────────────
        {
          id: 'geo7-t3-l2',
          topicId: 'geo7-t3',
          title: 'As Formas do Litoral',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 14,
          xpReward: 45,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## As Formas do Litoral

### O que é o Litoral?
O **litoral** é a zona de contacto entre a terra e o mar. É uma das zonas de maior biodiversidade e também uma das mais utilizadas pelos seres humanos (habitação, turismo, pesca, portos).

### A Erosão Marinha
O mar é um poderoso agente modelador do litoral. A **abrasão marinha** é o desgaste das rochas pela ação das ondas, correntes e marés. O resultado depende da resistência das rochas:

- **Rochas duras** → arriba (costa alta e escarpada)
- **Rochas moles** → praia (costa baixa e arenosa)

### Principais Formas do Litoral

**Costa alta (arriba):**
- Resultado da erosão marinha em rochas duras e resistentes
- É um paredão rochoso, vertical ou quase vertical
- **Arriba viva**: está a ser erodida atualmente pelo mar
- **Arriba morta**: já não é atingida pelo mar (o nível do mar desceu ou a arriba recuou)
- Pode ter uma **plataforma de abrasão**: superfície rochosa plana resultante da erosão da base da arriba
- Exemplos em Portugal: Costa Vicentina (Alentejo/Algarve), Cabo Espichel

**Costa baixa (praia):**
- Resultado da deposição de sedimentos (areia, seixos) em zonas de baixo declive
- É dinâmica — muda com as estações (inverno: erosão; verão: deposição)
- Pode ter **dunas** — acumulações de areia formadas pelo vento atrás da praia

**Outras formas:**
- **Cabo**: ponta de terra que avança para o mar (ex: Cabo da Roca — o ponto mais ocidental da Europa)
- **Baía**: reentrância do mar para a terra (ex: Baía de Setúbal)
- **Península**: porção de terra quase rodeada de mar (ex: Península de Tróia)
- **Ilha**: porção de terra completamente rodeada de mar (ex: Açores, Madeira)
- **Arquipélago**: conjunto de ilhas (ex: Açores, Madeira, Canárias)
- **Restinga**: faixa de areia que separa uma lagoa do mar
- **Sistema lagunar**: conjunto de lagoas separadas do mar por restingas (ex: Ria de Aveiro, Ria Formosa)
- **Tômbolo**: faixa de areia que une uma ilha ao continente

### A Plataforma Continental
A **plataforma continental** é a extensão submersa do continente, com profundidade que não ultrapassa os 200 metros. Tem grande importância para:
- A pesca (zona de grande riqueza biológica)
- A exploração de petróleo e gás natural
- A colocação de cabos submarinos

Portugal tem uma enorme plataforma continental, especialmente graças aos Açores e à Madeira.

### A Importância do Litoral
O litoral é fundamental para:
- **Turismo e lazer** (praias, desportos aquáticos)
- **Pesca e aquacultura**
- **Portos e comércio marítimo**
- **Biodiversidade** (habitats únicos)

⚠️ O litoral está ameaçado pela: erosão costeira, poluição, construção excessiva e subida do nível do mar (alterações climáticas).

> **Conceitos chave:** litoral, arriba viva/morta, plataforma de abrasão, abrasão marinha, cabo, baía, península, ilha, arquipélago, restinga, duna, plataforma continental`,
            keyPoints: [
              'O litoral é a zona de contacto entre a terra e o mar, moldada pela erosão marinha.',
              'Arriba = costa alta e rochosa (rochas duras); praia = costa baixa e arenosa (rochas moles ou deposição).',
              'Cabo é terra que avança para o mar; baía é reentrância do mar; península é terra quase rodeada de mar.',
              'A Ria de Aveiro e a Ria Formosa são sistemas lagunares separados do mar por restingas.',
              'O Cabo da Roca é o ponto mais ocidental da Europa continental.',
            ],
          },
        },

        // ── Lição 3: Quiz ───────────────────────────────
        {
          id: 'geo7-t3-l3',
          topicId: 'geo7-t3',
          title: 'Quiz — Rios e Litoral',
          type: 'quiz',
          difficulty: 'intermedio',
          estimatedMinutes: 12,
          xpReward: 75,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Qual é o maior rio completamente português?',
                type: 'multiple-choice',
                options: ['Tejo', 'Douro', 'Mondego', 'Guadiana'],
                correctAnswer: 2,
                explanation: 'O Mondego (234 km) é o maior rio completamente português — nasce e desagua em Portugal. O Tejo é o mais longo a correr em território português, mas nasce em Espanha.',
              },
              {
                id: 'q2',
                text: 'A bacia hidrográfica é o conjunto de todas as terras drenadas por um rio e pelos seus afluentes.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. A bacia hidrográfica inclui o rio principal, todos os seus afluentes e todas as terras que enviam água para esse sistema fluvial, delimitadas pelos divisores de águas.',
              },
              {
                id: 'q3',
                text: 'O que é uma arriba viva?',
                type: 'multiple-choice',
                options: [
                  'Uma praia com muita vegetação',
                  'Uma arriba que ainda é ativamente erodida pelo mar',
                  'Um cabo que avança muito para o oceano',
                  'Uma ilha de origem vulcânica',
                ],
                correctAnswer: 1,
                explanation: 'Uma arriba viva é uma costa alta e rochosa que está a ser erodida atualmente pelo mar. Uma arriba morta é aquela que o mar já não atinge.',
              },
              {
                id: 'q4',
                text: 'Qual é a forma de foz em que o rio desagua em leque, depositando sedimentos?',
                type: 'multiple-choice',
                options: ['Estuário', 'Delta', 'Meandro', 'Afluente'],
                correctAnswer: 1,
                explanation: 'O delta é uma foz em forma de leque, com deposição de sedimentos e formação de ilhotas. O estuário é uma foz alargada em forma de funil com influência das marés (como o Tejo).',
              },
              {
                id: 'q5',
                text: 'O Cabo da Roca é o ponto mais ocidental da Europa continental.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. O Cabo da Roca, em Portugal, é o ponto mais ocidental da Europa continental (cerca de 9°W de longitude), sendo uma das extremidades geográficas da Europa.',
              },
              {
                id: 'q6',
                text: 'O que é a Ria Formosa?',
                type: 'multiple-choice',
                options: [
                  'Um rio no Alentejo que desagua no Guadiana',
                  'Um sistema lagunar no Algarve, separado do mar por restingas',
                  'Uma praia no Norte de Portugal',
                  'Um cabo na Costa Vicentina',
                ],
                correctAnswer: 1,
                explanation: 'A Ria Formosa é um sistema lagunar no Algarve — um conjunto de lagoas separadas do oceano por barreiras arenosas (restingas e ilhas-barreira). É um parque natural de grande biodiversidade.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 4 — O MEIO NATURAL: CLIMA E BIOMAS
    // ══════════════════════════════════════════════════════
    {
      id: 'geo7-t4',
      disciplineId: 'geografia-7',
      title: 'Clima e Biomas do Mundo',
      description: 'Clima vs estado do tempo, zonas climáticas e os principais biomas do planeta.',
      order: 4,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto — Clima vs Estado do Tempo ───
        {
          id: 'geo7-t4-l1',
          topicId: 'geo7-t4',
          title: 'Clima e Estado do Tempo — Qual a Diferença?',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 16,
          xpReward: 50,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## Clima e Estado do Tempo

### A Diferença Fundamental
Esta é uma das questões mais importantes da Geografia:

**Estado do tempo** — as condições atmosféricas num **lugar específico** num **momento específico**.
- Ex: "Hoje em Lisboa está a chover com 15°C e vento forte."
- Muda constantemente — pode mudar de hora a hora

**Clima** — o conjunto das condições atmosféricas típicas de uma região, calculadas durante um **longo período** (pelo menos 30 anos).
- Ex: "Lisboa tem um clima mediterrâneo — verões quentes e secos, invernos amenos e chuvosos."
- É estável — não muda de um dia para o outro

> **Resumindo:** O estado do tempo é o que acontece hoje. O clima é o que costuma acontecer.

### Os Elementos do Clima
Os principais elementos que caracterizam o clima são:

**Temperatura**
- Medida em graus Celsius (°C) com um **termómetro**
- A temperatura varia com a **latitude** (mais frio nos polos, mais quente no Equador), a **altitude** (mais frio nas montanhas — cada 100 m de subida, a temperatura baixa cerca de 0,6°C), a **distância ao mar** e as **correntes oceânicas**

**Precipitação**
- Medida em milímetros (mm) com um **pluviómetro**
- Inclui chuva, neve e granizo
- Varia com a **latitude**, o **relevo** (mais chuva nas vertentes expostas ao vento) e a **distância ao mar**

### As Zonas Climáticas
A Terra divide-se em três grandes zonas climáticas, em função da **latitude**:

**Zona Quente (Intertropical)**
- Entre o Trópico de Câncer (23°27'N) e o Trópico de Capricórnio (23°27'S)
- Temperaturas altas todo o ano
- Inclui: clima equatorial, tropical húmido, tropical seco, desértico quente

**Zona Temperada**
- Entre os Trópicos e os Círculos Polares
- Quatro estações bem marcadas
- Inclui: clima mediterrâneo, oceânico/marítimo, continental, semiárido

**Zona Fria (Polar)**
- Entre os Círculos Polares e os Polos
- Temperaturas muito baixas, verões curtos e frios
- Inclui: clima subpolar, polar/glacial, alta montanha

### Portugal e o Clima
Portugal continental tem principalmente **clima mediterrâneo**:
- Verões quentes e secos
- Invernos amenos e chuvosos
- Norte mais chuvoso que o Sul
- Interior com temperaturas mais extremas que o litoral

> **Conceitos chave:** clima, estado do tempo, temperatura, precipitação, zona climática, termómetro, pluviómetro, gradiente térmico`,
            keyPoints: [
              'Estado do tempo = condições atmosféricas num lugar num momento específico (muda constantemente).',
              'Clima = condições típicas de uma região calculadas em 30 ou mais anos (é estável).',
              'Os principais elementos do clima são a temperatura (°C) e a precipitação (mm).',
              'As três zonas climáticas são: Zona Quente (entre os Trópicos), Temperada e Fria (polar).',
              'Portugal tem principalmente clima mediterrâneo: verões quentes e secos, invernos amenos e chuvosos.',
            ],
          },
        },

        // ── Lição 2: Texto — Biomas ─────────────────────
        {
          id: 'geo7-t4-l2',
          topicId: 'geo7-t4',
          title: 'Os Biomas do Mundo',
          type: 'text',
          difficulty: 'intermedio',
          estimatedMinutes: 20,
          xpReward: 60,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## Os Biomas do Mundo

### O que é um Bioma?
Um **bioma** é um grande ecossistema caracterizado por um tipo de vegetação e fauna adaptados ao clima da região. O clima determina a vegetação, que por sua vez determina os animais que ali vivem.

### Os Principais Biomas

---
**🌿 Floresta Equatorial (Floresta Tropical)**
- **Onde**: próxima do Equador (Amazónia, Congo, Sudeste Asiático)
- **Clima**: quente e húmido o ano todo; precipitação >2 000 mm/ano; sem estação seca
- **Vegetação**: floresta densa e sempre verde; árvores muito altas (30-50 m); enorme biodiversidade
- **Importância**: o "pulmão do planeta" — produz oxigénio e absorve CO₂
- **Ameaça**: desflorestação (pecuária, soja, madeira)

---
**🦁 Savana**
- **Onde**: entre a floresta equatorial e os desertos (África, Brasil, Austrália)
- **Clima**: quente; chuva só no verão (estação seca e estação húmida)
- **Vegetação**: ervas altas com árvores esparsas (ex: acácias em África)
- **Fauna típica**: leões, elefantes, girafas, zebras

---
**🌵 Deserto Quente**
- **Onde**: perto dos Trópicos (Saara, Arábia, Austrália interior)
- **Clima**: muito quente de dia, frio de noite; precipitação <250 mm/ano; muito seco
- **Vegetação**: muito escassa — catos, plantas suculentas
- **Maior deserto quente**: Saara (África) — 9 milhões de km²

---
**🌾 Estepe (Pradaria)**
- **Onde**: interior dos continentes (Ásia Central, América do Norte — Grandes Planícies)
- **Clima**: continental — verões quentes, invernos frios; pouca chuva
- **Vegetação**: ervas e gramíneas; árvores ausentes ou raras
- **Uso humano**: grande zona de produção de cereais

---
**🫒 Floresta Mediterrânea**
- **Onde**: bordas do Mediterrâneo, Califórnia, Chile, sul da Austrália, África do Sul
- **Clima**: mediterrâneo — verão quente e seco, inverno ameno e chuvoso
- **Vegetação**: arbustos resistentes à seca (carrasco, maquis), sobreiros, azinheiras, oliveiras, pinheiros
- **Portugal**: a vegetação típica do nosso país

---
**🍂 Floresta Caducifólia (Temperada)**
- **Onde**: Europa Ocidental, leste dos EUA, leste da Ásia
- **Clima**: temperado oceânico — 4 estações bem marcadas
- **Vegetação**: árvores que perdem as folhas no inverno (carvalhos, faias, castanheiros)
- **Importância**: zona de grande densidade populacional europeia

---
**🌲 Floresta de Coníferas (Taiga/Boreal)**
- **Onde**: norte da Europa, Rússia, Canadá
- **Clima**: frio — invernos longos e rigorosos, verões curtos
- **Vegetação**: pinheiros, abetos, cedros — árvores com folhas em forma de agulha (adaptadas ao frio e neve)
- **Maior floresta do mundo**: a taiga siberiana

---
**🧊 Tundra**
- **Onde**: Ártico e zonas subpolares (Alasca, Canadá, Rússia, Escandinávia)
- **Clima**: muito frio — verão curto, solo permanentemente gelado (permafrost)
- **Vegetação**: musgos, líquenes, pequenas plantas rasteiras; sem árvores
- **Fauna**: renas, ursos polares, bois almiscarados

---
**🏔️ Vegetação de Altitude**
- **Onde**: em qualquer montanha de alta altitude
- **Clima**: varia com a altitude — mais frio e menos oxigénio
- **Vegetação**: muda com a altitude — floresta na base, mato a meia encosta, prados alpinos no topo, neves perpétuas no cume
- **Exemplo**: na Serra da Estrela podem observar-se várias zonas de vegetação

### A Zonalidade dos Biomas
Os biomas distribuem-se em **faixas paralelas** ao Equador — do Equador para os Polos, a vegetação muda de forma previsível: Floresta Equatorial → Savana → Deserto → Estepe → Floresta Mediterrânea → Floresta Caducifólia → Floresta de Coníferas → Tundra → Gelo Polar.

> **Conceitos chave:** bioma, floresta equatorial, savana, deserto, estepe, floresta mediterrânea, floresta caducifólia, floresta de coníferas, tundra, zonalidade`,
            keyPoints: [
              'Um bioma é um grande ecossistema com vegetação e fauna adaptadas ao clima.',
              'Floresta Equatorial = clima quente e húmido todo o ano; savana = estação seca e húmida alternadas.',
              'O deserto quente tem menos de 250 mm de chuva por ano; o maior é o Saara.',
              'A floresta mediterrânea é o bioma típico de Portugal — sobreiros, azinheiras, pinheiros.',
              'Os biomas distribuem-se em faixas paralelas ao Equador — é a zonalidade dos biomas.',
            ],
          },
        },

        // ── Lição 3: Flashcards ─────────────────────────
        {
          id: 'geo7-t4-l3',
          topicId: 'geo7-t4',
          title: 'Flashcards — Clima e Biomas',
          type: 'flashcard',
          difficulty: 'intermedio',
          estimatedMinutes: 10,
          xpReward: 40,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'Qual a diferença entre clima e estado do tempo?', back: 'Estado do tempo = condições atmosféricas agora (muda constantemente). Clima = condições típicas durante 30+ anos (estável).', example: '"Está a chover hoje" = estado do tempo. "Em Portugal chove mais no inverno" = clima.' },
              { id: 'fc2', front: 'O que é a floresta equatorial?', back: 'Bioma de clima quente e húmido todo o ano, perto do Equador, com enorme biodiversidade. "Pulmão do planeta".', example: 'A floresta amazónica é a maior floresta equatorial do mundo.' },
              { id: 'fc3', front: 'Qual o bioma típico de Portugal?', back: 'Floresta Mediterrânea — com sobreiros, azinheiras, pinheiros e arbustos resistentes à seca.', example: 'O sobreiro é a árvore nacional de Portugal.' },
              { id: 'fc4', front: 'O que é a tundra?', back: 'Bioma das zonas subpolares — muito frio, solo permanentemente gelado (permafrost), só musgos e líquenes.', example: 'A tundra existe no norte da Rússia, Canadá e Alasca.' },
              { id: 'fc5', front: 'O que é a zonalidade dos biomas?', back: 'A distribuição dos biomas em faixas paralelas ao Equador, do mais quente (floresta equatorial) ao mais frio (tundra, gelo polar).', example: 'À medida que nos afastamos do Equador, a temperatura desce e os biomas mudam.' },
              { id: 'fc6', front: 'Qual é o maior deserto quente do mundo?', back: 'O Saara, em África, com cerca de 9 milhões de km².', example: 'O Saara tem temperaturas que podem ultrapassar os 50°C durante o dia.' },
              { id: 'fc7', front: 'O que é a taiga?', back: 'Floresta de coníferas (pinheiros, abetos) do norte da Europa, Rússia e Canadá — a maior floresta do mundo.', example: 'A taiga siberiana é o maior bioma florestal do planeta.' },
            ],
          },
        },

        // ── Lição 4: Quiz ───────────────────────────────
        {
          id: 'geo7-t4-l4',
          topicId: 'geo7-t4',
          title: 'Quiz — Clima e Biomas',
          type: 'quiz',
          difficulty: 'intermedio',
          estimatedMinutes: 12,
          xpReward: 80,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: '"Hoje em Lisboa está sol com 22°C" — isto é um exemplo de:',
                type: 'multiple-choice',
                options: ['Clima', 'Estado do tempo', 'Bioma', 'Zona climática'],
                correctAnswer: 1,
                explanation: 'Esta descrição refere condições atmosféricas num lugar específico (Lisboa) num momento específico (hoje) — é o estado do tempo. O clima seria a descrição das condições típicas de Lisboa ao longo de muitos anos.',
              },
              {
                id: 'q2',
                text: 'A floresta equatorial é conhecida como o "pulmão do planeta" porque produz muito oxigénio.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Verdadeiro. A floresta equatorial (especialmente a Amazónia) é chamada "pulmão do planeta" porque a sua densa vegetação produz enormes quantidades de oxigénio e absorve CO₂. A sua destruição agrava as alterações climáticas.',
              },
              {
                id: 'q3',
                text: 'Qual bioma tem ervas altas com árvores esparsas, estação seca e húmida alternadas, e é típico de África?',
                type: 'multiple-choice',
                options: ['Floresta Equatorial', 'Savana', 'Tundra', 'Estepe'],
                correctAnswer: 1,
                explanation: 'A savana é o bioma de África (e de outras regiões tropicais) com ervas altas e árvores esparsas (como acácias), com uma estação seca e uma húmida alternadas. É o habitat de leões, elefantes, girafas e zebras.',
              },
              {
                id: 'q4',
                text: 'O que é a zonalidade dos biomas?',
                type: 'multiple-choice',
                options: [
                  'A variação dos biomas com a altitude',
                  'A distribuição dos biomas em faixas paralelas ao Equador',
                  'A divisão dos biomas por continentes',
                  'A classificação dos biomas por temperatura',
                ],
                correctAnswer: 1,
                explanation: 'A zonalidade é a distribuição dos biomas em faixas paralelas ao Equador, determinada pela variação da temperatura e da precipitação com a latitude — do mais quente ao mais frio.',
              },
              {
                id: 'q5',
                text: 'Qual é o instrumento usado para medir a precipitação?',
                type: 'multiple-choice',
                options: ['Termómetro', 'Barómetro', 'Pluviómetro', 'Higrómetro'],
                correctAnswer: 2,
                explanation: 'O pluviómetro mede a precipitação (chuva, neve) em milímetros (mm). O termómetro mede a temperatura (°C), o barómetro mede a pressão atmosférica e o higrómetro mede a humidade do ar.',
              },
              {
                id: 'q6',
                text: 'Qual bioma caracteriza a vegetação típica de Portugal?',
                type: 'multiple-choice',
                options: ['Floresta Caducifólia', 'Savana', 'Floresta Mediterrânea', 'Floresta de Coníferas'],
                correctAnswer: 2,
                explanation: 'A floresta mediterrânea é o bioma típico de Portugal e de toda a região mediterrânea. Caracteriza-se por sobreiros, azinheiras, pinheiros e arbustos resistentes à seca do verão.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 5 — PORTUGAL NA UNIÃO EUROPEIA
    // ══════════════════════════════════════════════════════
    {
      id: 'geo7-t5',
      disciplineId: 'geografia-7',
      title: 'Portugal e a União Europeia',
      description: 'A localização de Portugal no Mundo, a União Europeia e a integração portuguesa.',
      order: 5,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'geo7-t5-l1',
          topicId: 'geo7-t5',
          title: 'Portugal no Mundo e na Europa',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 16,
          xpReward: 50,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## Portugal no Mundo e na Europa

### Localização de Portugal
Portugal localiza-se no **sudoeste da Europa**, na Península Ibérica, com costa no **Oceano Atlântico**. O território português divide-se em:
- **Portugal Continental** (mainlanda europeia)
- **Açores** (arquipélago no Atlântico Norte — 9 ilhas)
- **Madeira** (arquipélago no Atlântico — 2 ilhas principais)

**Coordenadas aproximadas de Portugal continental:**
- Latitude: entre 37°N (sul do Algarve) e 42°N (norte de Trás-os-Montes)
- Longitude: entre 6°W (interior) e 9°W (costa)

**Portugal limita com:**
- A norte e a leste: **Espanha** (única fronteira terrestre)
- A sul e a oeste: **Oceano Atlântico**

**Posição estratégica:** Portugal está na encruzilhada entre a Europa, a África e as Américas — o que historicamente favoreceu a exploração marítima (os Descobrimentos).

### A União Europeia (UE)
A **União Europeia** é uma organização supranacional que reúne atualmente **27 países europeus** (após a saída do Reino Unido em 2020 — o chamado *Brexit*).

**Origem histórica:**
Após a destruição da 2ª Guerra Mundial (1939-1945), os países europeus decidiram cooperar para evitar novos conflitos. Em 1957, seis países fundaram a **Comunidade Económica Europeia (CEE)** — a antecessora da UE atual.

**Portugal na UE:**
Portugal aderiu à CEE em **1 de janeiro de 1986**, juntamente com Espanha.

**Símbolos da UE:**
- **Bandeira**: fundo azul com 12 estrelas douradas (o círculo representa a unidade)
- **Hino**: "Ode à Alegria" de Beethoven
- **Dia da Europa**: 9 de maio
- **Lema**: "Unidos na Diversidade"
- **Moeda**: Euro (€) — usado por 20 países da chamada **Zona Euro** (Portugal adotou o Euro em 2002)

### Vantagens da Integração Europeia para Portugal
- **Livre circulação de pessoas** — os portugueses podem viver e trabalhar em qualquer país da UE
- **Livre circulação de mercadorias** — sem alfândegas entre os países membros
- **Fundos europeus** — financiamento para infraestruturas, educação, ambiente (Portugal recebeu milhares de milhões de euros)
- **Euro** — moeda única que facilita o comércio e as viagens
- **Paz e estabilidade** — os países membros não guerreiam entre si

### As Regiões de Portugal (NUTS)
Para fins estatísticos e de planeamento, Portugal está organizado em unidades territoriais chamadas **NUTS** (Nomenclatura das Unidades Territoriais para fins Estatísticos):

**Portugal Continental:**
- Norte, Centro, Área Metropolitana de Lisboa, Alentejo, Algarve

**Regiões Autónomas:**
- Região Autónoma dos Açores
- Região Autónoma da Madeira

**Divisões administrativas:**
- **Distritos** (18 no continente + 2 regiões autónomas) — divisão administrativa tradicional
- **Municípios** (concelhos) — 308 no total
- **Freguesias** — a unidade administrativa mais pequena

> **Conceitos chave:** localização relativa, localização absoluta, União Europeia, Euro, NUTS, distrito, município, freguesia, livre circulação`,
            keyPoints: [
              'Portugal localiza-se no sudoeste da Europa, na Península Ibérica, com costa no Oceano Atlântico.',
              'O território português inclui Portugal continental, os Açores e a Madeira.',
              'Portugal aderiu à União Europeia em 1 de janeiro de 1986.',
              'A UE tem 27 países membros, moeda única (Euro) e livre circulação de pessoas e mercadorias.',
              'Portugal está organizado administrativamente em distritos, municípios e freguesias.',
            ],
          },
        },

        // ── Lição 2: Quiz — Portugal e UE ───────────────
        {
          id: 'geo7-t5-l2',
          topicId: 'geo7-t5',
          title: 'Quiz — Portugal e a União Europeia',
          type: 'quiz',
          difficulty: 'basico',
          estimatedMinutes: 10,
          xpReward: 65,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Em que ano Portugal aderiu à Comunidade Económica Europeia (atual UE)?',
                type: 'multiple-choice',
                options: ['1974', '1986', '1992', '2002'],
                correctAnswer: 1,
                explanation: 'Portugal aderiu à CEE em 1 de janeiro de 1986, juntamente com Espanha. Esta adesão trouxe enormes fundos europeus que ajudaram a modernizar o país.',
              },
              {
                id: 'q2',
                text: 'Os Açores e a Madeira fazem parte do território português.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. O território português divide-se em Portugal continental, o arquipélago dos Açores (9 ilhas no Atlântico Norte) e o arquipélago da Madeira (2 ilhas principais).',
              },
              {
                id: 'q3',
                text: 'Quantos países fazem parte da União Europeia atualmente?',
                type: 'multiple-choice',
                options: ['25', '27', '28', '30'],
                correctAnswer: 1,
                explanation: 'A UE tem atualmente 27 países membros. O número era 28 antes de 2020, quando o Reino Unido saiu da UE (Brexit).',
              },
              {
                id: 'q4',
                text: 'Qual é a fronteira terrestre de Portugal?',
                type: 'multiple-choice',
                options: ['França', 'Marrocos', 'Espanha', 'Andorra'],
                correctAnswer: 2,
                explanation: 'Portugal tem fronteira terrestre apenas com Espanha, a norte e a este. A sul e a oeste é delimitado pelo Oceano Atlântico.',
              },
              {
                id: 'q5',
                text: 'O lema da União Europeia é "Unidos na Diversidade".',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. O lema da UE é "Unidos na Diversidade", que reflete a ideia de países com culturas, línguas e tradições diferentes que trabalham juntos em paz e cooperação.',
              },
            ],
          },
        },
      ],
    },
  ],
}
