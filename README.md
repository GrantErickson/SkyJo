# SkyJo Card Game

A browser-based implementation of the SkyJo card game built with Nuxt 3. Play against AI opponents with six distinct strategies, or run thousands of simulated games to discover which strategy reigns supreme.

## Features

- **Play Mode** — Play against 1–3 AI opponents, each using a selectable strategy
- **Simulation Mode** — Pit AI strategies against each other over configurable batches of games, with charts, stats, and CSV/JSON export
- **6 AI Strategies**
  - **Random** — Baseline; makes valid moves at random
  - **Greedy** — Takes low-value discards, replaces highest known cards
  - **Conservative** — Gathers information first, only swaps for significant improvements
  - **Aggressive** — Pursues column matches to remove cards, ends rounds quickly
  - **Balanced** — Adapts between conservative (early) and aggressive (late) play
  - **Memory** — Tracks seen cards and uses probability to make optimal decisions
- **Column Removal** — Three matching face-up cards in a column are automatically removed
- **Score Doubling Penalty** — The player who ends a round pays double if they don't have the lowest score
- **Polished UI** — Card flip animations, color-coded values, responsive layout

## Tech Stack

| Layer     | Technology                |
| --------- | ------------------------- |
| Framework | Nuxt 3 (SPA mode, no SSR) |
| Styling   | Tailwind CSS 3            |
| State     | Pinia                     |
| Charts    | Chart.js + vue-chartjs    |
| Icons     | lucide-vue-next           |
| Language  | TypeScript                |
| Testing   | Vitest                    |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

## Getting Started

```bash
# Clone the repo
git clone <repository-url>
cd SkyJo/skyjo-app

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Generate static site for production      |
| `npm run preview`   | Preview the production build locally     |
| `npm run test`      | Run unit tests with Vitest               |
| `npm run typecheck` | Run TypeScript type checking             |

## Project Structure

```
skyjo-app/
├── engine/              # Pure TypeScript game engine (no Vue dependency)
│   ├── types.ts         # All interfaces and type definitions
│   ├── constants.ts     # Card distribution, strategy configs
│   ├── deck.ts          # Deck creation and shuffling
│   ├── grid.ts          # Grid operations (flip, swap, column removal)
│   ├── scoring.ts       # Round scoring with doubling penalty
│   ├── rules.ts         # Turn execution, round initialization
│   ├── simulation.ts    # Headless game loop for batch simulation
│   └── ai/              # Strategy implementations
│       ├── index.ts     # Strategy factory and registry
│       ├── random.ts
│       ├── greedy.ts
│       ├── conservative.ts
│       ├── aggressive.ts
│       ├── balanced.ts
│       └── memory.ts
├── stores/              # Pinia state management
│   ├── gameStore.ts     # Interactive game state
│   ├── simStore.ts      # Simulation config, progress, results
│   └── settingsStore.ts # User preferences (persisted)
├── components/
│   ├── ui/              # Reusable UI primitives (button, modal, header, footer)
│   ├── game/            # Game board, cards, action panel, scoreboard
│   └── simulation/      # Config form, progress bar, charts, export
├── composables/         # Vue composables (AI turn runner)
├── pages/               # File-based routing (index, play, simulation)
├── utils/               # Helpers (seeded RNG, stats, colors, formatters)
└── assets/css/          # Tailwind entry point with card animations
```

## How to Play

1. Navigate to **Play Game** from the home screen
2. Choose the number of AI opponents (1–3) and select a strategy for each
3. **Setup phase**: Click two cards in your grid to flip them face-up
4. **Each turn**, choose one action:
   - **Take the discard** — swap it with any card in your grid
   - **Draw from the deck** — then either swap it with a grid card, or discard it and flip a face-down card
5. When any player reveals all their cards, each other player gets one final turn
6. The round ends and scores are tallied — lowest score wins
7. The game ends when any player reaches 100+ cumulative points

## Deploying to Azure Static Web Apps

The repository includes a GitHub Actions workflow at [.github/workflows/azure-static-web-apps.yml](.github/workflows/azure-static-web-apps.yml) that automatically builds and deploys the app on every push to `main`.

### Setup Steps

1. **Create the Static Web App resource in Azure**
   - Open the [Azure Portal](https://portal.azure.com) and search for **Static Web Apps**
   - Click **+ Create**
   - Fill in:
     - **Subscription** and **Resource Group** — choose or create as needed
     - **Name** — e.g. `skyjo`
     - **Plan type** — Free tier is sufficient
     - **Deployment source** — select **GitHub**
     - Sign in to GitHub and select this repository and the `main` branch
   - Azure will auto-detect the framework. Override if needed:
     - **App location**: `/skyjo-app`
     - **Output location**: `.output/public`
   - Click **Review + Create**, then **Create**

2. **Copy the deployment token**

   Azure automatically adds a GitHub Actions workflow and a repository secret when you link via the portal. If you prefer to use the workflow file already in this repo:
   - In the Azure Portal, open your Static Web App resource
   - Go to **Settings → Manage deployment token**
   - Copy the token

3. **Add the secret to GitHub**
   - In your GitHub repository, go to **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: paste the deployment token from step 2
   - Click **Add secret**

4. **Push to `main`** — the workflow will build and deploy automatically. Pull requests will generate preview environments.

### Manual Deployment (Azure CLI)

If you prefer deploying without GitHub Actions:

```bash
# Install the SWA CLI
npm install -g @azure/static-web-apps-cli

# Build the app
cd skyjo-app
npm run build

# Deploy
swa deploy .output/public --deployment-token <YOUR_TOKEN>
```

### Custom Domain (Optional)

In the Azure Portal, open your Static Web App → **Settings → Custom domains** → **+ Add** and follow the DNS verification steps.

## License

Private project — not licensed for redistribution.
