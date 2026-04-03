# estudar.pt 📚

Plataforma de estudos gamificada para o 3.º Ciclo do Ensino Básico em Portugal.

## 🚀 Início Rápido

```bash
npm install
npm run dev
```

Abre o browser em `http://localhost:5173`

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── layout/          # Sidebar, TopBar, Layout wrapper
│   ├── study/           # QuizLesson, TextLesson, AudioLesson, FlashcardLesson, LessonComplete
│   ├── dashboard/       # (componentes de dashboard reutilizáveis)
│   └── gamification/    # (badges, XP, conquistas)
├── pages/
│   ├── DashboardPage    # Visão geral, estatísticas, próxima aula
│   ├── StudyPage        # Lista de tópicos + aulas por tipo
│   ├── ExamSchedulePage # Data do exame + plano automático
│   ├── LeaderboardPage  # Ranking semanal por XP
│   └── ProfilePage      # Perfil, conquistas, estatísticas pessoais
├── store/
│   └── useStore.ts      # Estado global com Zustand + persistência
├── lib/
│   ├── mockData.ts      # Dados de exemplo (Matemática 9.º ano)
│   └── utils.ts         # Helpers: datas, XP, formatação
└── types/
    └── index.ts         # Todos os tipos TypeScript
```

---

## ✨ Funcionalidades Implementadas

### 📖 Tipos de Conteúdo
| Tipo | Descrição |
|------|-----------|
| `text` | Texto explicativo com markdown simples + pontos-chave |
| `audio` | Player de áudio com transcrição e pontos-chave |
| `quiz` | Perguntas de escolha múltipla / V/F com feedback imediato |
| `flashcard` | Cartões interativos frente/verso com exemplos |

### 🎯 Plano de Estudo Automático
- Define a data do exame → o sistema calcula aulas/dia necessárias
- Indicador visual de urgência (verde/amarelo/vermelho)
- Preview dos próximos 5 dias de estudo

### 🎮 Gamificação
- **XP** por cada aula completada (bónus por score no quiz)
- **Níveis** calculados progressivamente
- **Streak** de dias consecutivos de estudo
- **Badges** com raridade (Comum / Raro / Épico / Lendário)
- **Leaderboard** semanal

### 📊 Dashboard
- Gráfico de barras (minutos de estudo por dia)
- Stats: streak, horas totais, aulas, nível
- Progresso da disciplina + countdown ao exame
- Acesso rápido à próxima aula

---

## 🔧 Para Adicionar Mais Disciplinas

Edita `src/lib/mockData.ts` e adiciona uma nova entrada ao array `mockDisciplines`.

```ts
{
  id: 'portugues-9',
  name: 'Português',
  subject: 'Português',
  year: 9,
  color: '#10b981',
  icon: '📝',
  totalLessons: 40,
  completedLessons: 0,
  topics: [ /* ... */ ],
}
```

E regista a nova rota em `App.tsx`:
```tsx
<Route path="study/:disciplineId" element={<StudyPage />} />
```

---

## 🔌 Integrações Futuras (sugestões)

- **Backend real**: Supabase ou Firebase para persistência multi-dispositivo
- **Áudio real**: Ficheiros `.mp3` na pasta `/public/audio/` ou Cloudinary
- **TTS**: Web Speech API para gerar áudio dinamicamente
- **Notificações**: Lembrete diário via Service Worker / PWA
- **Relatórios para encarregados**: Exportação PDF de progresso

---

## 🛠️ Stack

- **React 18** + **TypeScript**
- **Vite** (bundler)
- **Tailwind CSS** (estilos)
- **Zustand** (estado global com persistência)
- **React Router v6** (navegação)
- **Recharts** (gráficos)
- **date-fns** (datas em português)
- **Framer Motion** (instalado, pronto para animações avançadas)
- **Lucide React** (ícones)

Fontes: **Sora** (títulos) · **Plus Jakarta Sans** (corpo) · **JetBrains Mono** (código)
