<template>
  <div
    class="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4"
  >
    <!-- Hero -->
    <div class="text-center mb-12">
      <h1 class="text-6xl font-extrabold text-white mb-4 tracking-tight">
        Sky<span class="text-yellow-400">Jo</span>
      </h1>
      <p class="text-xl text-emerald-200 max-w-md mx-auto">
        The classic card game of hidden grids and clever swaps. Lowest score
        wins!
      </p>
    </div>

    <!-- Mode Selection -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
      <!-- Play Mode -->
      <NuxtLink
        to="/play"
        class="group relative bg-emerald-800/60 hover:bg-emerald-700/70 border border-emerald-600/40 hover:border-emerald-500/60 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-900/30"
      >
        <div class="text-5xl mb-4">🃏</div>
        <h2 class="text-2xl font-bold text-white mb-2">Play Game</h2>
        <p class="text-emerald-300 text-sm">
          Play against 1–3 AI opponents with different strategies
        </p>
        <div
          class="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-yellow-400/30 transition-all duration-300"
        />
      </NuxtLink>

      <!-- Simulate Mode -->
      <NuxtLink
        to="/simulation"
        class="group relative bg-emerald-800/60 hover:bg-emerald-700/70 border border-emerald-600/40 hover:border-emerald-500/60 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-900/30"
      >
        <div class="text-5xl mb-4">📊</div>
        <h2 class="text-2xl font-bold text-white mb-2">Simulate</h2>
        <p class="text-emerald-300 text-sm">
          Pit AI strategies against each other and analyze results
        </p>
        <div
          class="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-yellow-400/30 transition-all duration-300"
        />
      </NuxtLink>
    </div>

    <!-- Quick Rules -->
    <div class="mt-16 max-w-lg text-center">
      <h3 class="text-lg font-semibold text-emerald-300 mb-3">How to Play</h3>
      <div class="grid grid-cols-3 gap-4 text-sm text-emerald-400">
        <div>
          <div class="text-2xl mb-1">🎯</div>
          <p>
            Get the <strong class="text-white">lowest score</strong> by swapping
            high cards for low ones
          </p>
        </div>
        <div>
          <div class="text-2xl mb-1">🔄</div>
          <p>
            Draw or take the discard to
            <strong class="text-white">improve your grid</strong>
          </p>
        </div>
        <div>
          <div class="text-2xl mb-1">✨</div>
          <p>
            Match 3 in a column to
            <strong class="text-white">remove them all</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: "SkyJo – Card Game" });
</script>
