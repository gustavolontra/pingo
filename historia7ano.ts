// ============================================================
// HISTÓRIA — 7.º ANO | 3.º CICLO
// Pronto a colar em src/lib/mockData.ts
// ============================================================

import type { Discipline } from '@/types'

export const historia7ano: Discipline = {
  id: 'historia-7',
  name: 'História',
  subject: 'História',
  year: 7,
  color: '#e05252',
  icon: '🏛️',
  totalLessons: 24,
  completedLessons: 0,
  topics: [

    // ══════════════════════════════════════════════════════
    // TÓPICO 1 — OS PRIMEIROS POVOS DA PENÍNSULA IBÉRICA
    // ══════════════════════════════════════════════════════
    {
      id: 'h7-t1',
      disciplineId: 'historia-7',
      title: 'Os Primeiros Povos da Península Ibérica',
      description: 'Iberos, Celtas, Fenícios, Gregos e Cartagineses — quem habitou a Península antes dos Romanos.',
      order: 1,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'h7-t1-l1',
          topicId: 'h7-t1',
          title: 'Os Primeiros Povos da Península Ibérica',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 15,
          xpReward: 50,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## Os Primeiros Povos da Península Ibérica

A Península Ibérica é habitada há muitos milhares de anos. Os primeiros povos eram **nómadas** — viviam da caça, da pesca e da recolha de frutos silvestres. Com a descoberta da agricultura, foram-se fixando junto dos rios e das terras mais férteis.

### Os Iberos
Os **Iberos** foram os primeiros povos a dar nome à Península. Vieram do norte de África e estabeleceram-se principalmente no sul e no leste da Península. Desenvolveram uma cultura avançada: cultivavam a vinha e a oliveira, criavam cavalos, dominavam a metalurgia e produziam arte de grande qualidade — como a célebre **Dama de Elche**. A sua sociedade estava dividida em governantes, nobres, sacerdotes, artesãos e escravos.

### Os Celtas
Por volta de 1000 a.C., chegaram os **Celtas**, vindos da Europa Central. Eram agricultores e guerreiros que trouxeram novas técnicas de trabalhar o **ferro e o ouro**. Viviam em castros (povoados fortificados de pedra) e organizavam-se em tribos. Os Celtas são considerados os introdutores da metalurgia do ferro na Europa.

### Os Celtiberos e os Lusitanos
Iberos e Celtas acabaram por se misturar, dando origem aos **Celtiberos**. Uma das tribos mais importantes foi a dos **Lusitanos**, que ocuparam uma grande parte do território que corresponde hoje a Portugal. O seu chefe mais famoso foi **Viriato**, célebre pela resistência feroz aos exércitos romanos.

### Os Povos do Mediterrâneo: Fenícios, Gregos e Cartagineses
Vindos do Mar Mediterrâneo, chegaram povos mais avançados:
- **Fenícios** (século X a.C.): fundaram colónias comerciais como Cádis. Introduziram o alfabeto e técnicas de navegação.
- **Gregos** (século VIII a.C.): estabeleceram colónias no leste da Península, como Ampúrias. Trouxeram o cultivo da vinha e da oliveira.
- **Cartagineses**: vieram do norte de África para controlar o comércio peninsular, especialmente as ricas minas de prata.

> **Conceitos importantes:** nómada, sedentário, castro, tribo, colónia comercial, metalurgia`,
            keyPoints: [
              'Os Iberos foram os primeiros povos a habitar a Península e deram-lhe o nome.',
              'Os Celtas chegaram por volta de 1000 a.C. e introduziram a metalurgia do ferro.',
              'A mistura de Iberos e Celtas deu origem aos Celtiberos e aos Lusitanos.',
              'Viriato foi o grande chefe lusitano que resistiu aos Romanos.',
              'Fenícios, Gregos e Cartagineses criaram colónias comerciais no litoral mediterrânico.',
            ],
          },
        },

        // ── Lição 2: Flashcards ─────────────────────────
        {
          id: 'h7-t1-l2',
          topicId: 'h7-t1',
          title: 'Flashcards — Primeiros Povos',
          type: 'flashcard',
          difficulty: 'basico',
          estimatedMinutes: 8,
          xpReward: 40,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'Quem foram os primeiros povos a habitar a Península Ibérica?', back: 'Os Iberos, vindos do norte de África.', example: 'O nome "Ibérica" vem precisamente de "Iberos".' },
              { id: 'fc2', front: 'O que são os Celtiberos?', back: 'O resultado da mistura entre Iberos e Celtas.', example: 'Os Lusitanos eram um dos povos celtiberos mais importantes.' },
              { id: 'fc3', front: 'Quem foi Viriato?', back: 'O grande chefe lusitano que resistiu à conquista romana.', example: 'Viriato usou táticas de guerrilha que derrotaram vários exércitos romanos.' },
              { id: 'fc4', front: 'O que introduziram os Celtas na Península?', back: 'A metalurgia do ferro e novas técnicas de trabalhar o ouro.', example: 'Os Celtas viviam em castros — povoados circulares de pedra.' },
              { id: 'fc5', front: 'Qual o contributo dos Fenícios para a civilização?', back: 'Introduziram o alfabeto e desenvolveram rotas comerciais marítimas.', example: 'A cidade de Cádis (atual Espanha) foi fundada pelos Fenícios.' },
              { id: 'fc6', front: 'O que é a Dama de Elche?', back: 'Uma escultura ibérica que representa uma figura feminina, símbolo da arte dos Iberos.', example: 'A Dama de Elche mostra o alto nível artístico dos Iberos.' },
            ],
          },
        },

        // ── Lição 3: Quiz ───────────────────────────────
        {
          id: 'h7-t1-l3',
          topicId: 'h7-t1',
          title: 'Quiz — Os Primeiros Povos',
          type: 'quiz',
          difficulty: 'basico',
          estimatedMinutes: 10,
          xpReward: 75,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Qual foi o povo que deu o nome à Península Ibérica?',
                type: 'multiple-choice',
                options: ['Celtas', 'Iberos', 'Lusitanos', 'Fenícios'],
                correctAnswer: 1,
                explanation: 'Os Iberos foram os primeiros a habitar a Península e deram-lhe o seu nome — "Ibérica".',
              },
              {
                id: 'q2',
                text: 'Viriato foi o grande chefe dos Lusitanos que resistiu aos Romanos.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. Viriato usou táticas de guerrilha e derrotou vários exércitos romanos antes de ser assassinado por traidores pagos por Roma.',
              },
              {
                id: 'q3',
                text: 'Que povo introduziu a metalurgia do ferro na Península Ibérica?',
                type: 'multiple-choice',
                options: ['Iberos', 'Cartagineses', 'Celtas', 'Gregos'],
                correctAnswer: 2,
                explanation: 'Os Celtas, vindos da Europa Central, trouxeram as técnicas de trabalhar o ferro quando chegaram à Península por volta de 1000 a.C.',
              },
              {
                id: 'q4',
                text: 'Qual destes povos fundou a cidade de Cádis na Península Ibérica?',
                type: 'multiple-choice',
                options: ['Gregos', 'Iberos', 'Lusitanos', 'Fenícios'],
                correctAnswer: 3,
                explanation: 'Os Fenícios fundaram Gadir (atual Cádis) por volta de 1100 a.C., uma das cidades mais antigas da Europa ocidental.',
              },
              {
                id: 'q5',
                text: 'Os Celtiberos resultaram da mistura de que dois povos?',
                type: 'multiple-choice',
                options: ['Fenícios e Gregos', 'Iberos e Celtas', 'Romanos e Iberos', 'Celtas e Cartagineses'],
                correctAnswer: 1,
                explanation: 'A fusão entre os Iberos e os Celtas deu origem aos Celtiberos, dos quais faziam parte os Lusitanos.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 2 — A CIVILIZAÇÃO GREGA
    // ══════════════════════════════════════════════════════
    {
      id: 'h7-t2',
      disciplineId: 'historia-7',
      title: 'A Civilização Grega',
      description: 'A Grécia Antiga, as cidades-Estado, a democracia ateniense e o legado grego para o mundo.',
      order: 2,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'h7-t2-l1',
          topicId: 'h7-t2',
          title: 'A Civilização Grega — As Cidades-Estado',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 18,
          xpReward: 55,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## A Civilização Grega

### O que une os Gregos?
O povo grego não formava um estado unificado. O que os unia eram a **língua grega** (apesar dos dialetos) e a **religião politeísta** — a crença nos mesmos deuses do Olimpo (Zeus, Atena, Apolo, etc.). Os Jogos Olímpicos, iniciados em 776 a.C. em Olímpia, eram também um momento de união entre as cidades-estado gregas.

### As Cidades-Estado (Pólis)
A sociedade grega organizava-se em **pólis** (cidades-estado). Cada pólis era uma unidade política independente com:
- Governo, leis e exército próprios
- Uma acrópole (parte alta, com templos)
- Uma ágora (praça pública, centro da vida política e comercial)

As principais pólis foram **Atenas** e **Esparta**.

### As Formas de Governo nas Pólis
As cidades-estado gregas experimentaram vários regimes políticos:
- **Monarquia**: governo de um rei
- **Oligarquia**: governo de poucos (a elite aristocrática). Esparta era governada por dois reis e um conselho de anciãos.
- **Tirania**: governo de um só homem que assumiu o poder pela força
- **Democracia**: governo do povo — os cidadãos participavam nas decisões

### A Democracia em Atenas
Atenas é conhecida como o berço da democracia. A palavra vem do grego *demos* (povo) + *kratos* (poder). Vários reformadores contribuíram para a sua criação:

- **Drácon** (621 a.C.): escreveu as primeiras leis (muito severas)
- **Sólon** (594 a.C.): proibiu a escravatura por dívidas e alargou a cidadania
- **Clístenes** (507 a.C.): criou a democracia propriamente dita, com igualdade perante a lei
- **Péricles** (séc. V a.C.): consolidou a democracia, pagando aos cidadãos para participarem na vida política

**Como funcionava?**
- A **Eclésia** era a Assembleia dos cidadãos — reunia-se 40 vezes por ano e decidia sobre leis, guerras e paz
- A **Boulé** (Conselho dos 500) preparava o trabalho da Eclésia
- Os cargos públicos eram atribuídos por sorteio

⚠️ **Limitação importante:** A democracia ateniense era muito limitada. Só tinham direito de cidadania os **homens adultos, filhos de pai e mãe atenienses**. Estavam excluídos: mulheres, escravos e estrangeiros (metecos). Apenas cerca de 10% da população tinha direitos políticos.

### Atenas vs Esparta
| | Atenas | Esparta |
|---|---|---|
| Governo | Democracia | Oligarquia |
| Valores | Cultura, filosofia, artes | Militarismo, guerra |
| Economia | Comércio marítimo | Agricultura e servidão dos Hilotas |
| Educação | Filosofia, retórica, música | Treino militar desde os 7 anos |

> **Conceitos chave:** pólis, democracia, cidadão, meteco, escravo, economia comercial e monetária, arte clássica`,
            keyPoints: [
              'As Pólis eram cidades-estado gregas independentes, com leis e governo próprios.',
              'A democracia nasceu em Atenas no século V a.C. — "demos" (povo) + "kratos" (poder).',
              'A Eclésia era a assembleia onde os cidadãos discutiam e votavam as leis.',
              'Só os homens adultos nascidos de pai e mãe atenienses eram cidadãos — mulheres, escravos e estrangeiros estavam excluídos.',
              'Atenas valorizava a cultura e a filosofia; Esparta era um estado militarista.',
            ],
          },
        },

        // ── Lição 2: Texto — Cultura e Legado ──────────
        {
          id: 'h7-t2-l2',
          topicId: 'h7-t2',
          title: 'O Legado da Grécia para o Mundo',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 12,
          xpReward: 45,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## O Legado da Grécia para o Mundo

A Grécia Antiga é considerada o **berço da civilização ocidental**. Os seus contributos são sentidos até hoje em múltiplas áreas.

### Filosofia
Os gregos inventaram a filosofia — a busca racional pela verdade. Os grandes nomes são:
- **Sócrates** — "Conhece-te a ti mesmo"; usava o diálogo para encontrar a verdade
- **Platão** — discípulo de Sócrates; descreveu a sociedade ideal em *A República*
- **Aristóteles** — discípulo de Platão; estudou biologia, física, política e ética

### Arte e Arquitetura
A arte grega procurava o ideal de beleza, com rigor matemático e harmonia:
- **Escultura**: representação perfeita do corpo humano (ex: *Discóbolo*)
- **Arquitetura**: o Partenon em Atenas é o exemplo máximo; os três estilos são Dórico, Jónico e Coríntio
- **Teatro**: os gregos criaram a tragédia e a comédia. Autores: Ésquilo, Sófocles, Eurípides

### Literatura e História
- **Homero** escreveu a *Ilíada* (guerra de Tróia) e a *Odisseia* (aventuras de Ulisses)
- **Heródoto** é considerado o "pai da História"
- **Tucídides** escreveu a história da Guerra do Peloponeso

### Ciência e Matemática
- **Pitágoras**: teorema de Pitágoras (a² + b² = c²)
- **Euclides**: geometria
- **Arquimedes**: física e matemática
- **Hipócrates**: medicina, o "pai da medicina"

### Os Jogos Olímpicos
Iniciados em **776 a.C.** em honra a Zeus, em Olímpia. Durante os jogos havia uma **trégua sagrada** — as guerras eram suspensas. As modalidades incluíam corrida, salto, lançamento de disco e dardo e corridas de carros.

### O Legado para Portugal e para a Europa
- A **democracia** — base dos sistemas políticos modernos
- A **filosofia** e o pensamento crítico
- O **teatro** e as artes
- O **método científico**
- Palavras portuguesas de origem grega: *democracia, filosofia, teatro, atletismo, medicina, biologia, geometria*...

> **Legado:** contributo de uma civilização para as que se lhe seguiram`,
            keyPoints: [
              'A Grécia criou a filosofia, a democracia, o teatro e grandes avanços na ciência.',
              'Sócrates, Platão e Aristóteles são os grandes filósofos gregos.',
              'Os Jogos Olímpicos começaram em 776 a.C. em Olímpia, em honra a Zeus.',
              'Homero escreveu a Ilíada e a Odisseia — obras fundamentais da literatura ocidental.',
              'Muitas palavras portuguesas têm origem grega: democracia, filosofia, teatro, atletismo...',
            ],
          },
        },

        // ── Lição 3: Flashcards ─────────────────────────
        {
          id: 'h7-t2-l3',
          topicId: 'h7-t2',
          title: 'Flashcards — Civilização Grega',
          type: 'flashcard',
          difficulty: 'basico',
          estimatedMinutes: 10,
          xpReward: 40,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'O que é uma Pólis?', back: 'Uma cidade-estado grega, com governo, leis e exército próprios.', example: 'Atenas e Esparta eram as pólis mais importantes.' },
              { id: 'fc2', front: 'O que significa democracia?', back: 'Do grego: "demos" (povo) + "kratos" (poder). Governo do povo.', example: 'Clístenes criou a democracia ateniense em 507 a.C.' },
              { id: 'fc3', front: 'O que era a Eclésia?', back: 'A assembleia dos cidadãos atenienses onde se votavam as leis.', example: 'A Eclésia reunia-se 40 vezes por ano e qualquer cidadão podia falar.' },
              { id: 'fc4', front: 'Quem eram os metecos?', back: 'Estrangeiros que viviam em Atenas mas não tinham direitos de cidadania.', example: 'Mulheres, escravos e metecos não podiam votar na Eclésia.' },
              { id: 'fc5', front: 'Quem escreveu a Ilíada e a Odisseia?', back: 'Homero.', example: 'A Ilíada narra a Guerra de Tróia; a Odisseia conta as aventuras de Ulisses.' },
              { id: 'fc6', front: 'O que era a ágora?', back: 'A praça pública grega, centro da vida política e comercial da pólis.', example: 'Era na ágora que os cidadãos se encontravam para debater política e fazer comércio.' },
              { id: 'fc7', front: 'Qual a diferença entre tragédia e comédia no teatro grego?', back: 'A tragédia representava dramas com heróis e deuses; a comédia satirizava a sociedade.', example: 'Ésquilo e Sófocles escreveram tragédias; Aristófanes escreveu comédias.' },
            ],
          },
        },

        // ── Lição 4: Quiz ───────────────────────────────
        {
          id: 'h7-t2-l4',
          topicId: 'h7-t2',
          title: 'Quiz — A Civilização Grega',
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
                text: 'O que era a Eclésia na democracia ateniense?',
                type: 'multiple-choice',
                options: [
                  'O templo dedicado a Atena na Acrópole',
                  'A assembleia dos cidadãos que votava as leis',
                  'O conselho de anciãos de Esparta',
                  'O mercado onde se fazia comércio',
                ],
                correctAnswer: 1,
                explanation: 'A Eclésia era a assembleia popular de Atenas, onde os cidadãos discutiam e votavam sobre leis, guerras e outros assuntos importantes. Reunia-se cerca de 40 vezes por ano.',
              },
              {
                id: 'q2',
                text: 'Na democracia ateniense, as mulheres tinham direitos de cidadania.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 1,
                explanation: 'Falso. Na democracia ateniense, apenas os homens adultos, filhos de pai e mãe atenienses, eram considerados cidadãos. Mulheres, escravos e estrangeiros (metecos) estavam excluídos.',
              },
              {
                id: 'q3',
                text: 'Quem foi Péricles?',
                type: 'multiple-choice',
                options: [
                  'O filósofo que criou a República',
                  'O general que conquistou a Pérsia',
                  'O estadista que consolidou a democracia ateniense no século V a.C.',
                  'O rei que unificou as cidades-estado gregas',
                ],
                correctAnswer: 2,
                explanation: 'Péricles foi o grande estadista de Atenas no século V a.C. que consolidou a democracia, pagando aos cidadãos para participarem na vida política, independentemente da sua riqueza.',
              },
              {
                id: 'q4',
                text: 'Quando foram realizados os primeiros Jogos Olímpicos?',
                type: 'multiple-choice',
                options: ['1000 a.C.', '776 a.C.', '500 a.C.', '336 a.C.'],
                correctAnswer: 1,
                explanation: 'Os primeiros Jogos Olímpicos foram realizados em 776 a.C. em Olímpia, em honra ao deus Zeus. Durante os jogos havia uma trégua sagrada entre as cidades-estado.',
              },
              {
                id: 'q5',
                text: 'Qual destas obras foi escrita por Homero?',
                type: 'multiple-choice',
                options: ['A República', 'A Odisseia', 'Édipo Rei', 'A Política'],
                correctAnswer: 1,
                explanation: 'Homero escreveu a Ilíada (sobre a Guerra de Tróia) e a Odisseia (as aventuras de Ulisses após a guerra). A República é de Platão, Édipo Rei de Sófocles, e A Política de Aristóteles.',
              },
              {
                id: 'q6',
                text: 'Esparta era conhecida principalmente pelo seu sistema democrático.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 1,
                explanation: 'Falso. Esparta era uma cidade-estado militarista, governada por uma oligarquia (dois reis e um conselho de anciãos). O seu foco era o treino militar, não a democracia.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 3 — O IMPÉRIO ROMANO
    // ══════════════════════════════════════════════════════
    {
      id: 'h7-t3',
      disciplineId: 'historia-7',
      title: 'O Império Romano',
      description: 'A expansão de Roma, a romanização, a economia e a sociedade romana, e o surgimento do Cristianismo.',
      order: 3,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'h7-t3-l1',
          topicId: 'h7-t3',
          title: 'O Império Romano — Expansão e Romanização',
          type: 'text',
          difficulty: 'intermedio',
          estimatedMinutes: 20,
          xpReward: 60,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## O Império Romano

### Da República ao Império
Roma foi primeiro uma **República** (509–27 a.C.), governada pelo Senado e pelos cônsules. Com as guerras de expansão, surgiram generais poderosos como **Júlio César**. Após a sua morte, o seu sobrinho **Octávio Augusto** tornou-se o primeiro imperador (27 a.C.), dando início ao **Império Romano**.

### A Expansão de Roma
No seu apogeu (séculos II–III d.C.), o Império Romano controlava toda a bacia do Mediterrâneo — os romanos chamavam-lhe **Mare Nostrum** ("o nosso mar"). O império estendia-se por três continentes: Europa, Ásia e África.

A conquista da **Península Ibérica** começou em 218 a.C. durante as Guerras Púnicas contra Cartago. Os **Lusitanos**, liderados por **Viriato**, resistiram durante décadas, mas acabaram derrotados.

### A Romanização
**Romanização** é o processo pelo qual Roma transmitiu a sua cultura aos povos conquistados. Os principais agentes de romanização foram:

- **O Latim**: língua oficial do Império — deu origem ao Português, Espanhol, Francês, Italiano e Romeno
- **O Direito Romano**: conjunto de leis aplicadas uniformemente em todo o Império — base do direito moderno
- **A Rede Viária**: vasta rede de estradas que permitia a circulação de tropas, pessoas e mercadorias (*"Todos os caminhos vão dar a Roma"*)
- **O Exército (Legiões)**: garantia a *Pax Romana* (paz imposta) e difundia a cultura romana
- **Os Municípios**: administração local que integrava as populações no sistema romano
- **O Imperador**: figura sagrada que simbolizava a unidade do Império
- **O Édito de Caracala (212 d.C.)**: concedeu a cidadania romana a todos os homens livres do Império

### A Economia Romana
A economia romana era caracterizada por quatro elementos:
1. **Urbana** — baseada nas cidades (municípios)
2. **Comercial** — o comércio era a principal atividade; as estradas e o Mar Mediterrâneo facilitavam as trocas
3. **Monetária** — utilizava moeda (Aureus de ouro, Denário de prata, Sestércio de cobre)
4. **Esclavagista** — os escravos (prisioneiros de guerra) trabalhavam nos campos, nas minas e nas obras públicas

### A Sociedade Romana
A sociedade era hierarquizada e estratificada:

- **Ordem Senatorial**: senadores, magistrados, governadores de províncias — possuíam grandes latifúndios
- **Ordem Equestre**: cavaleiros dedicados ao comércio e à administração
- **Plebe**: o grupo mais numeroso — camponeses, artesãos, comerciantes
- **Libertos**: escravos a quem foi concedida a liberdade
- **Escravos**: sem direitos, trabalhavam nas condições mais duras

### O Poder Imperial
O imperador acumulava os poderes político, militar e religioso. Era considerado um ser divino — o culto ao imperador era um fator de unidade em todo o Império. Havia também o **Senado** (que assessorava o imperador) e os **Comícios** (assembleias populares).

> **Conceitos chave:** império, magistrado, administração, urbanismo, Direito, romanização, Pax Romana, latifúndio, escravo`,
            keyPoints: [
              'O Império Romano nasceu em 27 a.C. com Octávio Augusto como primeiro imperador.',
              'A romanização difundiu o latim, o direito, as estradas e os costumes romanos pelos povos conquistados.',
              'A economia romana era urbana, comercial, monetária e esclavagista.',
              'A sociedade era hierarquizada: ordem senatorial, equestre, plebe, libertos e escravos.',
              'O latim originou as línguas românicas: Português, Espanhol, Francês, Italiano e Romeno.',
            ],
          },
        },

        // ── Lição 2: Texto — Cristianismo ───────────────
        {
          id: 'h7-t3-l2',
          topicId: 'h7-t3',
          title: 'O Surgimento do Cristianismo',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 12,
          xpReward: 45,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## O Surgimento do Cristianismo

### Contexto Histórico
O Cristianismo surgiu na **Palestina**, uma região do Médio Oriente que estava ocupada pelo Império Romano no século I d.C. Era uma época de agitação social — o povo judeu ansiava por um Messias (salvador).

### Jesus Cristo e os Seus Ensinamentos
**Jesus de Nazaré** começou a pregar por volta de 30 d.C. Os seus ensinamentos baseavam-se no amor ao próximo, na misericórdia, na igualdade de todos os seres humanos perante Deus e na esperança de vida eterna.

Os seus seguidores acreditavam que ele era o **Filho de Deus** e o Messias prometido. Foi crucificado pelas autoridades romanas, mas os seus discípulos afirmaram que ressuscitou — este é o núcleo da fé cristã.

O livro sagrado do Cristianismo é a **Bíblia**, composta pelo:
- **Antigo Testamento** — textos hebraicos partilhados com o Judaísmo
- **Novo Testamento** — os evangelhos e outros textos sobre Jesus e os primeiros cristãos

### A Expansão do Cristianismo
O Cristianismo expandiu-se rapidamente pelo Império Romano por várias razões:
- A **rede de estradas romanas** facilitava as viagens dos missionários
- A mensagem de **igualdade e esperança** atraía os mais pobres e os escravos
- Os **apóstolos** (como S. Paulo) percorreram o Império pregando o novo credo
- O Império Romano permitia a circulação de pessoas e ideias

### Perseguições e Reconhecimento
No início, os cristãos foram **perseguidos** pelos romanos, pois recusavam adorar o imperador como deus. Muitos foram martirizados.

Com o **Édito de Milão** (313 d.C.), o imperador **Constantino** decretou a tolerância religiosa, permitindo o Cristianismo. Mais tarde, em 380 d.C., o **Édito de Tessalónica** tornou o Cristianismo a religião oficial do Império Romano.

### Continuidade e Mudança
O Cristianismo representou uma **continuidade** com o Judaísmo (Antigo Testamento, monoteísmo) mas também uma **mudança** profunda: a mensagem universal de amor e salvação para todos os seres humanos, independentemente da origem social ou etnia.

> **Conceitos chave:** Cristianismo, cristão, Antigo Testamento, Novo Testamento, continuidade, mudança`,
            keyPoints: [
              'O Cristianismo surgiu na Palestina no século I d.C., numa região ocupada pelos Romanos.',
              'Jesus Cristo pregou o amor ao próximo e a igualdade de todos perante Deus.',
              'O Cristianismo expandiu-se usando a rede de estradas e a língua comum do Império Romano.',
              'O Édito de Milão (313 d.C.) de Constantino garantiu a liberdade religiosa aos cristãos.',
              'Em 380 d.C., o Cristianismo tornou-se a religião oficial do Império Romano.',
            ],
          },
        },

        // ── Lição 3: Flashcards ─────────────────────────
        {
          id: 'h7-t3-l3',
          topicId: 'h7-t3',
          title: 'Flashcards — Império Romano',
          type: 'flashcard',
          difficulty: 'intermedio',
          estimatedMinutes: 10,
          xpReward: 40,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'O que é a romanização?', back: 'O processo de difusão da cultura romana pelos povos conquistados.', example: 'A romanização da Península Ibérica trouxe o latim, o direito e as estradas.' },
              { id: 'fc2', front: 'O que significa Mare Nostrum?', back: '"O nosso mar" em latim — como os romanos chamavam ao Mar Mediterrâneo.', example: 'O controlo do Mare Nostrum foi essencial para a expansão comercial de Roma.' },
              { id: 'fc3', front: 'O que é a Pax Romana?', back: 'Período de paz e estabilidade no Império Romano, garantido pelo poder militar.', example: 'A Pax Romana durou cerca de 200 anos, entre os séculos I e II d.C.' },
              { id: 'fc4', front: 'Quais eram os 4 características da economia romana?', back: 'Urbana, Comercial, Monetária e Esclavagista.', example: 'Os escravos trabalhavam nos campos (latifúndios), nas minas e nas obras públicas.' },
              { id: 'fc5', front: 'O que foi o Édito de Caracala?', back: 'Decreto de 212 d.C. que concedeu a cidadania romana a todos os homens livres do Império.', example: 'Com o Édito de Caracala, os habitantes da Península Ibérica tornaram-se cidadãos romanos.' },
              { id: 'fc6', front: 'Onde e quando surgiu o Cristianismo?', back: 'Na Palestina, no século I d.C., durante a ocupação romana.', example: 'Jesus Cristo foi crucificado pelos Romanos por volta de 33 d.C.' },
              { id: 'fc7', front: 'O que é o latifúndio?', back: 'Grande propriedade rural pertencente à ordem senatorial romana, trabalhada por escravos.', example: 'Os latifúndios produziam trigo, vinho e azeite para todo o Império.' },
            ],
          },
        },

        // ── Lição 4: Quiz ───────────────────────────────
        {
          id: 'h7-t3-l4',
          topicId: 'h7-t3',
          title: 'Quiz — O Império Romano',
          type: 'quiz',
          difficulty: 'intermedio',
          estimatedMinutes: 15,
          xpReward: 90,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Qual foi o principal fator de unificação cultural dos povos conquistados por Roma?',
                type: 'multiple-choice',
                options: [
                  'A religião cristã',
                  'A língua latim e o Direito Romano',
                  'Os jogos gladiatórios',
                  'A monarquia hereditária',
                ],
                correctAnswer: 1,
                explanation: 'O latim (língua) e o Direito Romano (leis) foram os principais elementos que unificaram os povos do Império, complementados pela rede viária, os municípios e o exército.',
              },
              {
                id: 'q2',
                text: 'A expressão "Todos os caminhos vão dar a Roma" refere-se à extensa rede viária romana.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. Os romanos construíram uma vasta rede de estradas (50.000 km) que ligava todo o Império a Roma, facilitando o movimento de tropas, pessoas e mercadorias.',
              },
              {
                id: 'q3',
                text: 'Qual imperador decretou a tolerância ao Cristianismo através do Édito de Milão?',
                type: 'multiple-choice',
                options: ['Júlio César', 'Augusto', 'Constantino', 'Caracala'],
                correctAnswer: 2,
                explanation: 'O imperador Constantino decretou o Édito de Milão em 313 d.C., que garantia a liberdade religiosa no Império Romano e permitiu ao Cristianismo expandir-se livremente.',
              },
              {
                id: 'q4',
                text: 'Que línguas modernas são descendentes do latim romano?',
                type: 'multiple-choice',
                options: [
                  'Inglês, Alemão e Holandês',
                  'Português, Espanhol, Francês, Italiano e Romeno',
                  'Grego, Árabe e Persa',
                  'Russo, Polaco e Checo',
                ],
                correctAnswer: 1,
                explanation: 'As línguas românicas — Português, Espanhol, Francês, Italiano e Romeno — são todas descendentes do latim falado no Império Romano.',
              },
              {
                id: 'q5',
                text: 'A economia romana baseava-se principalmente na escravatura.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'A economia romana era esclavagista — os escravos (prisioneiros de guerra) constituíam a principal mão de obra nos campos, minas e obras públicas. Além disso, era também urbana, comercial e monetária.',
              },
              {
                id: 'q6',
                text: 'Onde surgiu o Cristianismo?',
                type: 'multiple-choice',
                options: ['No Egipto', 'Em Roma', 'Na Palestina', 'Na Grécia'],
                correctAnswer: 2,
                explanation: 'O Cristianismo surgiu na Palestina, uma região do Médio Oriente ocupada pelo Império Romano, onde Jesus Cristo viveu e pregou no século I d.C.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 4 — A EUROPA MEDIEVAL E O FEUDALISMO
    // ══════════════════════════════════════════════════════
    {
      id: 'h7-t4',
      disciplineId: 'historia-7',
      title: 'A Europa Medieval e o Feudalismo',
      description: 'A queda do Império Romano, as invasões bárbaras, o feudalismo e a sociedade medieval.',
      order: 4,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'h7-t4-l1',
          topicId: 'h7-t4',
          title: 'A Queda de Roma e o Feudalismo',
          type: 'text',
          difficulty: 'intermedio',
          estimatedMinutes: 20,
          xpReward: 60,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## A Europa Medieval e o Feudalismo

### A Queda do Império Romano do Ocidente (476 d.C.)
Entre os séculos III e V, o Império Romano enfrentou uma profunda crise:
- **Invasões bárbaras** — povos germânicos (Visigodos, Vândalos, Francos, Saxões) invadiram as fronteiras
- **Crise económica** — diminuição do número de escravos reduziu a produção
- **Instabilidade política** — constantes disputas pelo poder imperial
- **Divisão do Império** (395 d.C.) — em Ocidente e Oriente

Em **476 d.C.**, o último imperador do Ocidente, Rómulo Augústulo, foi deposto pelo chefe bárbaro Odoacro. Este é o marco convencional do fim da Idade Antiga e o início da **Idade Média**.

### As Invasões Bárbaras na Península Ibérica
A partir do século V, vários povos germânicos invadiram a Península Ibérica:
- **Suevos** — fixaram-se no noroeste (atual Portugal e Galiza)
- **Vândalos** — atravessaram a Península em direção ao norte de África
- **Visigodos** — ocuparam a maior parte da Península e criaram o **Reino Visigótico** (séculos VI–VIII)

Os Visigodos, apesar de inicialmente menos desenvolvidos, adotaram a **cultura romana** e converteram-se ao **Cristianismo**.

### O Surgimento do Feudalismo
Com a queda do Império Romano e as invasões, instalou-se um clima de insegurança. O poder dos reis enfraqueceu e as populações procuraram proteção junto dos grandes senhores locais.

O **Feudalismo** foi o sistema político, económico e social que dominou a Europa nos séculos IX a XIII. As suas características principais eram:
- **Descentralização do poder** — o rei tinha pouco poder real; eram os senhores feudais que governavam os seus territórios
- **Relações de vassalagem** — um senhor (suserano) cedía terras (feudo) a outro (vassalo) em troca de serviços militares e fidelidade
- **Economia agrária** — baseada na agricultura e na exploração das terras pelos servos
- **Importância da Igreja** — a Igreja Católica era a instituição mais poderosa, com vastas terras e influência política

### A Organização do Feudo
O feudo era a unidade de produção do feudalismo, geralmente dividido em:
- **Manso Senhorial** — terras do senhor, com o castelo, a igreja, o moinho, o forno e o lagar
- **Manso Servil** — terras cedidas aos servos para que as cultivassem
- **Manso Comunal** — terras de uso comum (bosques, pastos)

Os servos tinham várias obrigações:
- **Corveia** — trabalho gratuito nas terras do senhor (geralmente 3 dias por semana)
- **Talha** — entrega de parte da colheita ao senhor
- **Banalidade** — pagamento para usar o moinho, o forno ou o lagar do senhor
- **Dízimo** — décima parte da produção entregue à Igreja

### As Relações de Vassalagem
- O **suserano** cedia terras (feudo) ao vassalo
- O **vassalo** jurava fidelidade ao suserano (cerimónia de homenagem) e prestava serviço militar
- Este sistema criava uma hierarquia: Rei → Duques/Condes → Barões → Cavaleiros → Servos

> **Conceitos chave:** aristocracia, feudo, clero, nobreza, povo, servo, vassalo`,
            keyPoints: [
              'O Império Romano do Ocidente caiu em 476 d.C. com a invasão dos povos bárbaros germânicos.',
              'O Feudalismo foi o sistema medieval baseado na posse de terras e nas relações de vassalagem.',
              'O feudo era dividido em manso senhorial, servil e comunal.',
              'Os servos tinham obrigações: corveia, talha, banalidade e dízimo.',
              'O suserano cedia terras ao vassalo em troca de serviço militar e fidelidade.',
            ],
          },
        },

        // ── Lição 2: Texto — Sociedade Medieval ─────────
        {
          id: 'h7-t4-l2',
          topicId: 'h7-t4',
          title: 'A Sociedade Medieval — Os Três Grupos',
          type: 'text',
          difficulty: 'basico',
          estimatedMinutes: 14,
          xpReward: 50,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## A Sociedade Medieval — Os Três Grupos

### A Sociedade Tripartida
A sociedade medieval estava dividida em **três grupos** (ou ordens), cada um com uma função:

**"Os que rezam, os que guerreiam e os que trabalham"** — esta frase do bispo Adalberon de Laon resume a organização social medieval.

### 1. O Clero (Os que rezam — *Oratores*)
O clero era o grupo mais poderoso da Idade Média. Compreendia todos os servos de Deus: bispos, abades, monges, padres.

**Funções:** orar, cuidar da salvação das almas, administrar os sacramentos e auxiliar os governantes.

**Privilégios:**
- Isenção de impostos
- Leis e tribunais próprios (o Direito Canónico)
- Posse de vastas extensões de terras
- Acesso à educação e à escrita — os mosteiros preservavam o conhecimento

O clero dividia-se em:
- **Clero Regular**: monges e freiras que viviam em mosteiros segundo uma regra (ex: Beneditinos)
- **Clero Secular**: sacerdotes que viviam no mundo (padres, bispos, arcebispos, o Papa)

### 2. A Nobreza (Os que guerreiam — *Bellatores*)
A nobreza era formada pelos grandes proprietários de terra — os senhores feudais.

**Função:** combater para defender a sociedade e o rei.

**Hierarquia (do mais ao menos poderoso):**
Rei → Duques → Condes → Viscondes → Barões → Cavaleiros

**Privilégios:** isenção de impostos, tribunais próprios, direito de cobrar impostos às populações dos seus feudos.

Os cavaleiros seguiam um código de honra chamado **cavalaria**: lealdade ao senhor, coragem, proteção dos mais fracos, devoção à Igreja.

### 3. O Povo (Os que trabalham — *Laboratores*)
O povo era o grupo mais numeroso e menos privilegiado. Incluía:

- **Servos** — camponeses não-livres, presos à terra do senhor. Não podiam abandonar o feudo sem autorização. A sua vida era miserável.
- **Vilões** — camponeses livres que viviam nas vilas, podiam mudar de terra mas continuavam dependentes dos senhores.
- **Artesãos e comerciantes** — viviam nas cidades emergentes (burgos).

O povo tinha obrigações pesadas: pagar impostos, trabalhar nas terras do senhor e entregar parte das colheitas.

### A Mobilidade Social
A sociedade medieval era **estamental** — a posição social dependia do nascimento e praticamente não havia mobilidade. Quem nascia servo, morria servo. A Igreja era a única via de ascensão social para os filhos do povo.

### O Papel da Igreja
A Igreja Católica foi a **grande unificadora** da Europa medieval:
- Ensinava que a ordem social era vontade de Deus
- Controlava a educação (escolas nos mosteiros)
- Preservava os manuscritos antigos
- Exercia grande influência política sobre os reis
- Organizava as Cruzadas (expedições militares à Terra Santa)

> **Conceitos chave:** aristocracia, feudo, clero, nobreza, povo, servo, vassalo, cavalaria, dízimo`,
            keyPoints: [
              'A sociedade medieval dividia-se em três grupos: Clero (oram), Nobreza (guerreiam) e Povo (trabalham).',
              'O Clero era o grupo mais poderoso — tinha terras, tribunais próprios e controlava a educação.',
              'A Nobreza era formada pelos proprietários de terras (senhores feudais) com obrigação de defender a sociedade.',
              'O Povo era o grupo mais numeroso — os servos estavam presos à terra e viviam em condições miseráveis.',
              'A sociedade era estamental: quase nenhuma mobilidade social entre os grupos.',
            ],
          },
        },

        // ── Lição 3: Flashcards ─────────────────────────
        {
          id: 'h7-t4-l3',
          topicId: 'h7-t4',
          title: 'Flashcards — Feudalismo',
          type: 'flashcard',
          difficulty: 'basico',
          estimatedMinutes: 8,
          xpReward: 35,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'Quais são os três grupos da sociedade medieval?', back: 'Clero (oram), Nobreza (guerreiam) e Povo (trabalham).', example: '"Os que rezam, os que guerreiam e os que trabalham" — Bispo Adalberon de Laon.' },
              { id: 'fc2', front: 'O que é um feudo?', back: 'Terra cedida pelo suserano ao vassalo em troca de serviço militar e fidelidade.', example: 'O feudo era a unidade básica de organização económica e política do feudalismo.' },
              { id: 'fc3', front: 'O que é a corveia?', back: 'Obrigação de os servos trabalharem gratuitamente nas terras do senhor (geralmente 3 dias/semana).', example: 'Para além da corveia, os servos pagavam ainda a talha, a banalidade e o dízimo.' },
              { id: 'fc4', front: 'O que é a vassalagem?', back: 'Relação de fidelidade entre o vassalo e o suserano, em troca de terras e proteção.', example: 'Na cerimónia de homenagem, o vassalo jurava fidelidade ao suserano de joelhos.' },
              { id: 'fc5', front: 'Qual é a data da queda do Império Romano do Ocidente?', back: '476 d.C.', example: 'O último imperador, Rómulo Augústulo, foi deposto pelo chefe bárbaro Odoacro.' },
              { id: 'fc6', front: 'O que é o dízimo?', back: 'Imposto de 10% da produção agrícola entregue à Igreja.', example: 'O dízimo era obrigatório para todos os camponeses, independentemente da sua condição.' },
              { id: 'fc7', front: 'Quem eram os servos?', back: 'Camponeses não-livres, presos à terra do senhor, sem possibilidade de a abandonar.', example: 'Os servos não podiam casar fora do feudo sem autorização do seu senhor.' },
            ],
          },
        },

        // ── Lição 4: Quiz ───────────────────────────────
        {
          id: 'h7-t4-l4',
          topicId: 'h7-t4',
          title: 'Quiz — Feudalismo e Sociedade Medieval',
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
                text: 'Qual foi o evento que marca convencionalmente o fim do Império Romano do Ocidente?',
                type: 'multiple-choice',
                options: [
                  'A batalha de Maratona em 490 a.C.',
                  'A queda de Constantinopla em 1453',
                  'A deposição de Rómulo Augústulo em 476 d.C.',
                  'O Édito de Milão em 313 d.C.',
                ],
                correctAnswer: 2,
                explanation: 'Em 476 d.C., o chefe bárbaro Odoacro depôs o último imperador romano do Ocidente, Rómulo Augústulo. Este é o marco convencional do fim da Idade Antiga e início da Idade Média.',
              },
              {
                id: 'q2',
                text: 'Na sociedade feudal, os servos podiam abandonar livremente as terras do seu senhor.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 1,
                explanation: 'Falso. Os servos estavam presos à terra — eram camponeses não-livres que não podiam abandonar o feudo sem autorização do senhor. Esta era uma das principais diferenças entre servos e vilões.',
              },
              {
                id: 'q3',
                text: 'O que era a corveia?',
                type: 'multiple-choice',
                options: [
                  'Um tipo de moeda medieval',
                  'O trabalho gratuito dos servos nas terras do senhor',
                  'Um imposto pago à Igreja',
                  'Um código de honra dos cavaleiros',
                ],
                correctAnswer: 1,
                explanation: 'A corveia era a obrigação de os servos trabalharem gratuitamente nas terras do senhor (manso senhorial), geralmente durante três dias por semana.',
              },
              {
                id: 'q4',
                text: 'Qual dos seguintes grupos da sociedade medieval era responsável pela defesa militar?',
                type: 'multiple-choice',
                options: ['O Clero', 'A Nobreza', 'Os Servos', 'Os Vilões'],
                correctAnswer: 1,
                explanation: 'A nobreza (os bellatores — "os que guerreiam") tinha como função principal a defesa militar da sociedade. Os cavaleiros prestavam serviço militar ao seu senhor.',
              },
              {
                id: 'q5',
                text: 'A Igreja Católica tinha pouca influência na sociedade medieval.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 1,
                explanation: 'Falso. A Igreja Católica era a instituição mais poderosa da Idade Média — possuía vastas terras, controlava a educação, influenciava os reis e ensinava que a ordem social era vontade de Deus.',
              },
              {
                id: 'q6',
                text: 'O que é o dízimo?',
                type: 'multiple-choice',
                options: [
                  'Um décimo da produção entregue à Igreja',
                  'O pagamento para usar o moinho do senhor',
                  'O juramento de fidelidade ao suserano',
                  'O trabalho gratuito nas terras do senhor',
                ],
                correctAnswer: 0,
                explanation: 'O dízimo era um imposto de 10% (um décimo) da produção agrícola que todos os camponeses eram obrigados a entregar à Igreja Católica.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 5 — O MUNDO MUÇULMANO
    // ══════════════════════════════════════════════════════
    {
      id: 'h7-t5',
      disciplineId: 'historia-7',
      title: 'O Mundo Muçulmano',
      description: 'O Islão, a expansão muçulmana e a presença árabe na Península Ibérica (Al-Andalus).',
      order: 5,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'h7-t5-l1',
          topicId: 'h7-t5',
          title: 'O Islão e a Expansão Muçulmana',
          type: 'text',
          difficulty: 'intermedio',
          estimatedMinutes: 18,
          xpReward: 55,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## O Mundo Muçulmano

### O Surgimento do Islão
O **Islão** surgiu na Península Arábica no século VII d.C. O seu fundador foi **Maomé** (570–632 d.C.), que afirmava ter recebido revelações de Deus (Allah) através do anjo Gabriel.

Os ensinamentos de Maomé foram reunidos no **Corão**, o livro sagrado do Islão. O Islão é uma religião **monoteísta** (crença num único Deus — Allah) e partilha raízes com o Judaísmo e o Cristianismo.

**Os cinco pilares do Islão:**
1. **Chahada** — A profissão de fé: "Não há outro Deus senão Allah e Maomé é o seu profeta"
2. **Salah** — Orar 5 vezes por dia em direção a Meca
3. **Zakat** — Dar esmola aos pobres
4. **Sawm** — Jejum durante o Ramadão
5. **Hajj** — Peregrinação a Meca pelo menos uma vez na vida

### A Expansão do Islão
Após a morte de Maomé, os seus sucessores (os califas) lideraram uma rápida expansão militar e religiosa:
- **Século VII**: conquista da Arábia, Pérsia, Síria, Palestina e Egipto
- **Século VIII**: norte de África, Hispânia (711 d.C.) e partes da Índia

A língua e a religião eram os grandes **fatores de unidade** do mundo muçulmano.

### Al-Andalus — Os Muçulmanos na Península Ibérica
Em **711 d.C.**, um exército muçulmano, comandado por **Táriq ibn Ziyad**, atravessou o Estreito de Gibraltar e derrotou os Visigodos na **Batalha de Guadalete**.

Em apenas cinco anos, quase toda a Península Ibérica estava sob domínio muçulmano. Os Muçulmanos chamaram a Península de **Al-Andalus**.

### A Convivência na Península
Os Muçulmanos foram, em geral, **tolerantes** com as populações conquistadas:
- Quem se convertia ao Islão: muçulmanos
- Cristãos que adotaram costumes muçulmanos mas mantiveram a fé: **moçárabes**
- Judeus e cristãos que não se converteram: podiam manter a sua religião mediante o pagamento de um imposto

### A Civilização Muçulmana — Contributos
O mundo muçulmano era **cosmopolita, comercial e urbano**. Trouxe grandes avanços à Península:

**Agricultura:**
- Sistema de irrigação com **noras** e canais
- Introdução de novas culturas: laranjeiras, amendoeiras, arroz, algodão, cana-de-açúcar

**Ciência e Cultura:**
- Preservaram e traduziram obras gregas e romanas
- Matemática: introduziram os algarismos árabes e o zero
- Medicina, astronomia, filosofia e poesia floresceram
- Criação de grandes bibliotecas (Córdova tinha 400.000 volumes)

**Legado em Portugal:**
Muitas palavras portuguesas têm origem árabe: *alface, azeitona, alcácer, álcool, algarismo, açúcar, arroz, almofada, almôço, almoçavar...*

> **Conceitos chave:** Islão, monoteísmo, Corão, califa, Al-Andalus, moçárabe`,
            keyPoints: [
              'O Islão surgiu na Arábia no século VII com Maomé, que afirmava ter recebido revelações de Deus.',
              'Em 711 d.C., os Muçulmanos conquistaram a Península Ibérica, chamando-lhe Al-Andalus.',
              'Os Muçulmanos foram tolerantes — cristãos podiam manter a sua fé pagando um imposto.',
              'A civilização muçulmana avançou na agricultura, ciência, matemática e medicina.',
              'Muitas palavras portuguesas têm origem árabe: alface, açúcar, arroz, algarismo...',
            ],
          },
        },

        // ── Lição 2: Quiz ───────────────────────────────
        {
          id: 'h7-t5-l2',
          topicId: 'h7-t5',
          title: 'Quiz — O Mundo Muçulmano',
          type: 'quiz',
          difficulty: 'intermedio',
          estimatedMinutes: 10,
          xpReward: 70,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Quando é que os Muçulmanos conquistaram a Península Ibérica?',
                type: 'multiple-choice',
                options: ['476 d.C.', '622 d.C.', '711 d.C.', '1000 d.C.'],
                correctAnswer: 2,
                explanation: 'Em 711 d.C., o general muçulmano Táriq ibn Ziyad derrotou os Visigodos na Batalha de Guadalete e iniciou a conquista da Península Ibérica, que os árabes chamaram Al-Andalus.',
              },
              {
                id: 'q2',
                text: 'Como se chamavam os cristãos que viviam em Al-Andalus e adotaram costumes muçulmanos mas mantiveram a fé cristã?',
                type: 'multiple-choice',
                options: ['Mouros', 'Moçárabes', 'Almóadas', 'Cruzados'],
                correctAnswer: 1,
                explanation: 'Os moçárabes eram cristãos que viviam sob domínio muçulmano, adotaram a língua árabe e alguns costumes islâmicos, mas continuaram a ser cristãos.',
              },
              {
                id: 'q3',
                text: 'O Islão é uma religião politeísta.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 1,
                explanation: 'Falso. O Islão é monoteísta — acredita num único Deus, Allah. A frase central do Islão é "Não há outro Deus senão Allah e Maomé é o seu profeta".',
              },
              {
                id: 'q4',
                text: 'Qual é o livro sagrado do Islão?',
                type: 'multiple-choice',
                options: ['Bíblia', 'Torá', 'Corão', 'Vedas'],
                correctAnswer: 2,
                explanation: 'O Corão é o livro sagrado do Islão, que contém as revelações recebidas por Maomé de Deus (Allah).',
              },
              {
                id: 'q5',
                text: 'Qual destes contributos agrícolas foi introduzido pelos Muçulmanos na Península Ibérica?',
                type: 'multiple-choice',
                options: ['Trigo', 'Batata', 'Sistema de irrigação com noras', 'Milho'],
                correctAnswer: 2,
                explanation: 'Os Muçulmanos introduziram sistemas de irrigação sofisticados (noras e canais) e novas culturas como a laranjeira, amendoeira, arroz, algodão e cana-de-açúcar.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════
    // TÓPICO 6 — A FORMAÇÃO DE PORTUGAL
    // ══════════════════════════════════════════════════════
    {
      id: 'h7-t6',
      disciplineId: 'historia-7',
      title: 'A Formação do Reino de Portugal',
      description: 'A Reconquista Cristã, D. Afonso Henriques e os momentos-chave da independência de Portugal.',
      order: 6,
      isUnlocked: true,
      lessons: [

        // ── Lição 1: Texto ──────────────────────────────
        {
          id: 'h7-t6-l1',
          topicId: 'h7-t6',
          title: 'A Reconquista e a Formação de Portugal',
          type: 'text',
          difficulty: 'intermedio',
          estimatedMinutes: 22,
          xpReward: 65,
          isCompleted: false,
          content: {
            type: 'text',
            body: `## A Formação do Reino de Portugal

### A Reconquista Cristã
Após a conquista muçulmana de 711 d.C., alguns nobres visigodos e cristãos que se refugiaram no norte da Península iniciaram a **Reconquista** — um processo de recuperação progressiva dos territórios aos Muçulmanos.

Em **722 d.C.**, o rei Pelágio venceu os Muçulmanos na **Batalha de Covadonga** — considera-se este o início da Reconquista Cristã.

A Reconquista foi longa e difícil, com muitos avanços e recuos. Os reinos cristãos que se formaram foram:
- Reino das Astúrias (que deu origem a Leão e Castela)
- Reino de Navarra
- Reino de Aragão
- Condado Portucalense (que daria origem a Portugal)

Para a Reconquista contribuíram também as **Ordens Religiosas Militares** — monges guerreiros que combatiam em nome da fé cristã:
- Ordem dos Templários
- Ordem de Santiago
- Ordem dos Hospitalários

### O Condado Portucalense
Em 1096, o rei **D. Afonso VI** de Leão e Castela entregou o governo do **Condado Portucalense** ao nobre francês **D. Henrique de Borgonha**, casado com sua filha ilegítima D. Teresa. Em troca, D. Henrique lutava contra os Muçulmanos.

D. Henrique procurou ganhar autonomia para o seu condado, mas morreu em 1112 sem o conseguir. Sucedeu-lhe **D. Teresa**, que se aliou à nobreza galega — o que desagradou à nobreza portucalense.

### D. Afonso Henriques — O Fundador de Portugal

**1128 — Batalha de São Mamede**
O jovem D. Afonso Henriques, filho de D. Henrique e D. Teresa, apoiado pela nobreza portucalense, enfrentou e venceu a sua própria mãe na **Batalha de São Mamede** (Guimarães). A partir desta data, assumiu o governo do Condado Portucalense.

**1139 — Batalha de Ourique**
D. Afonso Henriques venceu um poderoso exército muçulmano comandado por cinco reis mouros na **Batalha de Ourique**. A vitória foi tão expressiva que as suas tropas o aclamaram **Rei de Portugal**. O brasão de armas português tem cinco escudetes que representam esses cinco reis mouros vencidos.

**1143 — Tratado de Zamora**
D. Afonso VII de Leão e Castela, primo de D. Afonso Henriques, reconheceu-o como **rei de Portugal** através do **Tratado de Zamora**. Este foi o primeiro reconhecimento político da independência portuguesa.

**1147 — Conquista de Santarém e Lisboa**
D. Afonso Henriques conquista **Santarém** (por surpresa, de madrugada) e, com o auxílio de cruzados do norte da Europa, conquista **Lisboa** — eventos fundamentais na expansão do reino para sul.

**1179 — Bula Manifestis Probatum**
O Papa **Alexandre III** reconheceu D. Afonso Henriques como rei e Portugal como **reino independente** através da bula *Manifestis Probatum*. Este foi o reconhecimento definitivo da independência, pois os reis cristãos obedeciam ao Papa.

### A Continuação da Reconquista
Após D. Afonso Henriques, os seus sucessores continuaram a Reconquista:
- **D. Sancho I, D. Afonso II, D. Sancho II** — continuaram as conquistas no Alentejo
- **D. Afonso III** (1249) — conquistou Silves e Faro, concluindo a Reconquista em território português

**1297 — Tratado de Alcanices**
No reinado de **D. Dinis**, foi assinado o **Tratado de Alcanices** com Leão e Castela, definindo as fronteiras de Portugal. Estas são atualmente **uma das mais antigas e estáveis fronteiras da Europa**.

### Momentos-Chave da Independência de Portugal
| Ano | Evento |
|---|---|
| 1096 | D. Henrique recebe o Condado Portucalense |
| 1112 | Morte de D. Henrique; D. Teresa governa |
| 1128 | Batalha de São Mamede — D. Afonso Henriques assume o poder |
| 1139 | Batalha de Ourique — proclamado Rei |
| 1143 | Tratado de Zamora — reconhecimento por Leão e Castela |
| 1147 | Conquista de Santarém e Lisboa |
| 1179 | Bula Manifestis Probatum — reconhecimento pelo Papa |
| 1249 | Conclusão da Reconquista (D. Afonso III) |
| 1297 | Tratado de Alcanices — fronteiras definitivas |

> **Conceitos chave:** condado, reconquista, independência política, vassalagem, bula papal, cruzados`,
            keyPoints: [
              'A Reconquista Cristã começou em 722 d.C. com a Batalha de Covadonga e demorou mais de 500 anos.',
              'D. Afonso Henriques venceu a Batalha de São Mamede (1128) e assumiu o governo do Condado Portucalense.',
              'A Batalha de Ourique (1139) levou à proclamação de D. Afonso Henriques como Rei de Portugal.',
              'O Tratado de Zamora (1143) e a Bula Manifestis Probatum (1179) reconheceram a independência de Portugal.',
              'O Tratado de Alcanices (1297) fixou as fronteiras de Portugal, que se mantêm até hoje.',
            ],
          },
        },

        // ── Lição 2: Flashcards — Formação de Portugal ──
        {
          id: 'h7-t6-l2',
          topicId: 'h7-t6',
          title: 'Flashcards — Datas e Eventos Chave',
          type: 'flashcard',
          difficulty: 'basico',
          estimatedMinutes: 10,
          xpReward: 40,
          isCompleted: false,
          content: {
            type: 'flashcard',
            cards: [
              { id: 'fc1', front: 'O que foi a Batalha de São Mamede e quando ocorreu?', back: '1128 — D. Afonso Henriques venceu a sua mãe D. Teresa e assumiu o governo do Condado Portucalense.', example: 'A batalha foi travada em Guimarães, considerada o berço de Portugal.' },
              { id: 'fc2', front: 'O que foi a Batalha de Ourique e qual a sua importância?', back: '1139 — D. Afonso Henriques venceu cinco reis mouros e foi aclamado Rei de Portugal.', example: 'Os cinco escudetes do brasão de armas português representam os cinco reis mouros vencidos.' },
              { id: 'fc3', front: 'O que foi o Tratado de Zamora?', back: '1143 — Acordo pelo qual D. Afonso VII de Leão e Castela reconheceu D. Afonso Henriques como rei de Portugal.', example: 'Foi o primeiro reconhecimento político da independência portuguesa.' },
              { id: 'fc4', front: 'O que foi a Bula Manifestis Probatum?', back: '1179 — Documento do Papa Alexandre III que reconheceu Portugal como reino independente.', example: 'O reconhecimento papal era fundamental pois todos os reis cristãos obedeciam ao Papa.' },
              { id: 'fc5', front: 'O que foi o Tratado de Alcanices?', back: '1297 — Acordo que definiu as fronteiras entre Portugal e Castela, as quais se mantêm até hoje.', example: 'Assinado no reinado de D. Dinis, Portugal tem uma das fronteiras mais antigas e estáveis da Europa.' },
              { id: 'fc6', front: 'Quem foram os moçárabes?', back: 'Cristãos que viviam em Al-Andalus, adotaram costumes muçulmanos mas mantiveram a fé cristã.', example: 'Os moçárabes falavam árabe mas rezavam em latim nas suas igrejas.' },
              { id: 'fc7', front: 'Quando terminou a Reconquista em Portugal?', back: 'Em 1249, com a conquista de Silves e Faro pelo rei D. Afonso III.', example: 'A Reconquista em Espanha só terminou em 1492, com a tomada de Granada.' },
            ],
          },
        },

        // ── Lição 3: Quiz ───────────────────────────────
        {
          id: 'h7-t6-l3',
          topicId: 'h7-t6',
          title: 'Quiz — A Formação de Portugal',
          type: 'quiz',
          difficulty: 'avancado',
          estimatedMinutes: 15,
          xpReward: 100,
          isCompleted: false,
          content: {
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                text: 'Em que batalha D. Afonso Henriques foi aclamado Rei de Portugal pelas suas tropas?',
                type: 'multiple-choice',
                options: ['Batalha de Covadonga', 'Batalha de São Mamede', 'Batalha de Ourique', 'Batalha de Guadalete'],
                correctAnswer: 2,
                explanation: 'Na Batalha de Ourique (1139), D. Afonso Henriques derrotou os exércitos de cinco reis mouros. A vitória foi tão expressiva que as suas tropas o aclamaram Rei de Portugal.',
              },
              {
                id: 'q2',
                text: 'Que documento do Papa reconheceu Portugal como reino independente em 1179?',
                type: 'multiple-choice',
                options: ['Bula Manifestis Probatum', 'Tratado de Zamora', 'Édito de Milão', 'Tratado de Alcanices'],
                correctAnswer: 0,
                explanation: 'A Bula Manifestis Probatum, emitida pelo Papa Alexandre III em 1179, reconheceu oficialmente Portugal como reino independente e D. Afonso Henriques como seu rei legítimo.',
              },
              {
                id: 'q3',
                text: 'Qual foi a batalha em que D. Afonso Henriques derrotou a sua própria mãe para assumir o governo do Condado Portucalense?',
                type: 'multiple-choice',
                options: ['Batalha de Ourique', 'Batalha de São Mamede', 'Batalha de Covadonga', 'Batalha de Arcos de Valdevez'],
                correctAnswer: 1,
                explanation: 'Na Batalha de São Mamede (1128), em Guimarães, D. Afonso Henriques derrotou as tropas leais à sua mãe, D. Teresa, e assumiu o governo do Condado Portucalense.',
              },
              {
                id: 'q4',
                text: 'A Reconquista em território português terminou em 1249 com a conquista de que cidade?',
                type: 'multiple-choice',
                options: ['Lisboa', 'Évora', 'Faro', 'Beja'],
                correctAnswer: 2,
                explanation: 'A Reconquista em Portugal terminou em 1249, no reinado de D. Afonso III, com a conquista de Faro (e Silves) no Algarve.',
              },
              {
                id: 'q5',
                text: 'Em que ano foi assinado o Tratado de Alcanices que fixou as fronteiras de Portugal?',
                type: 'multiple-choice',
                options: ['1143', '1179', '1249', '1297'],
                correctAnswer: 3,
                explanation: 'O Tratado de Alcanices foi assinado em 1297, no reinado de D. Dinis, e fixou as fronteiras entre Portugal e Castela. Estas fronteiras mantêm-se praticamente inalteradas até hoje.',
              },
              {
                id: 'q6',
                text: 'D. Henrique de Borgonha era pai de D. Afonso Henriques.',
                type: 'true-false',
                options: ['Verdadeiro', 'Falso'],
                correctAnswer: 0,
                explanation: 'Correto. D. Henrique de Borgonha, nobre francês que recebeu o Condado Portucalense em 1096, foi o pai de D. Afonso Henriques — o fundador de Portugal.',
              },
              {
                id: 'q7',
                text: 'Qual o documento pelo qual Leão e Castela reconheceram D. Afonso Henriques como rei?',
                type: 'multiple-choice',
                options: ['Tratado de Alcanices', 'Bula Manifestis Probatum', 'Tratado de Zamora', 'Édito de Caracala'],
                correctAnswer: 2,
                explanation: 'O Tratado de Zamora (1143) foi o acordo pelo qual D. Afonso VII de Leão e Castela reconheceu D. Afonso Henriques como rei de Portugal — o primeiro reconhecimento político da independência portuguesa.',
              },
            ],
          },
        },
      ],
    },
  ],
}
