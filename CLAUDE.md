# Best Of - Bracket Challenge

Interactive tournament bracket web app where users pick favorites in head-to-head matchups across categories (albums, villains, video games).

## Tech Stack

- **Framework:** React 18 + TypeScript 5
- **Build:** Vite 6
- **Styling:** Tailwind CSS 3 + Framer Motion
- **Routing:** React Router DOM 6
- **Effects:** Canvas Confetti

## Commands

```bash
npm run dev       # Start dev server
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── pages/          # HomePage, GamePage, WinnerPage
├── components/     # MatchupCard, TournamentCard, RoundTransition
├── context/        # TournamentContext (useReducer state management)
├── data/           # Tournament data (albums, villains, games)
├── types/          # TypeScript interfaces
└── utils/          # Sound utilities
```

## Architecture

- State managed via `useReducer` in `TournamentContext`
- Tournament flow: idle -> playing -> finished
- Routes: `/` (home), `/game` (play), `/winner` (results)
- Base path `/best_of/` for GitHub Pages deployment

## Conventions

- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`)
- Functional components with hooks
- Tailwind for all styling, no CSS modules
- English for all code, comments, and documentation

## Workflow

This project uses an **issue-based workflow** with 4 specialized agents:

1. **Product Manager** (`pm`) - Scopes features, writes use cases/test scenarios, opens issues and PRs
2. **Tester** (`tester`) - Writes tests based on PM's test scenarios
3. **Full-Stack Engineer** (`engineer`) - Implements features
4. **Senior Engineer** (`reviewer`) - Reviews code quality, enforces best practices, merges

See `.claude/agents/` for agent definitions.

### Issue-Based Flow

1. PM opens a GitHub issue with scope, use cases, test scenarios, and acceptance criteria
2. Engineer creates a feature branch from the issue
3. Tester writes tests based on PM's scenarios
4. Engineer implements the feature to pass all tests
5. PM opens the PR with a descriptive summary
6. Senior Engineer reviews, gives feedback, and merges when approved
