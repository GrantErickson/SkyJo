import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  SimulationConfig,
  SimulationResult,
  StrategyId,
} from "~/engine/types";
import { runSimulation } from "~/engine/simulation";

export const useSimStore = defineStore("sim", () => {
  const config = ref<SimulationConfig>({
    numGames: 1000,
    numPlayers: 3,
    strategies: ["greedy", "memory", "aggressive"],
  });

  const isRunning = ref(false);
  const progress = ref(0);
  const result = ref<SimulationResult | null>(null);
  const error = ref<string | null>(null);
  const worker = ref<Worker | null>(null);

  function setConfig(newConfig: Partial<SimulationConfig>) {
    config.value = { ...config.value, ...newConfig };
  }

  function setStrategies(strategies: StrategyId[]) {
    config.value.strategies = strategies;
  }

  function setNumPlayers(num: 2 | 3 | 4) {
    config.value.numPlayers = num;
    // Adjust strategies array
    while (config.value.strategies.length < num) {
      config.value.strategies.push("balanced");
    }
    config.value.strategies = config.value.strategies.slice(0, num);
  }

  async function startSimulation() {
    isRunning.value = true;
    progress.value = 0;
    error.value = null;
    result.value = null;

    try {
      // Run synchronously in chunks with setTimeout to keep UI responsive
      const simResult = await runSimulationAsync(
        config.value,
        (completed, total) => {
          progress.value = Math.round((completed / total) * 100);
        },
      );
      result.value = simResult;
    } catch (e: any) {
      error.value = e.message || "Simulation failed";
    } finally {
      isRunning.value = false;
      progress.value = 100;
    }
  }

  function cancelSimulation() {
    isRunning.value = false;
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  }

  function exportResults(format: "csv" | "json") {
    if (!result.value) return;

    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === "json") {
      content = JSON.stringify(result.value, null, 2);
      mimeType = "application/json";
      filename = `skyjo-simulation-${Date.now()}.json`;
    } else {
      content = generateCSV(result.value);
      mimeType = "text/csv";
      filename = `skyjo-simulation-${Date.now()}.csv`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    config,
    isRunning,
    progress,
    result,
    error,
    setConfig,
    setStrategies,
    setNumPlayers,
    startSimulation,
    cancelSimulation,
    exportResults,
  };
});

async function runSimulationAsync(
  config: SimulationConfig,
  onProgress: (completed: number, total: number) => void,
): Promise<SimulationResult> {
  // Run in chunks to keep UI responsive
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = runSimulation(config, onProgress);
      resolve(result);
    }, 50);
  });
}

function generateCSV(result: SimulationResult): string {
  const headers = ["game", "winner_strategy", "num_rounds"];
  for (let i = 0; i < result.config.numPlayers; i++) {
    headers.push(`player_${i}_strategy`, `player_${i}_score`);
  }

  const rows = [headers.join(",")];
  for (const game of result.gamesData) {
    const row = [game.gameIndex + 1, game.winnerStrategy, game.numRounds];
    for (let i = 0; i < result.config.numPlayers; i++) {
      row.push(result.config.strategies[i] as any, game.playerScores[i] as any);
    }
    rows.push(row.join(","));
  }

  return rows.join("\n");
}
