<template>
  <div class="min-h-[calc(100vh-8rem)] py-6 px-4 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-2">How to Play SkyJo</h1>
    <p class="text-emerald-300 mb-8">
      SkyJo is a card game where the goal is to have the lowest score. Swap,
      flip, and match your way to victory!
    </p>

    <!-- Card Values -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span class="text-2xl">🃏</span> Card Values
      </h2>
      <div
        class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5"
      >
        <p class="text-emerald-300 text-sm mb-4">
          The deck has 150 cards with values from
          <strong class="text-yellow-400">-2</strong> to
          <strong class="text-red-400">12</strong>. Lower is better!
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <div
            v-for="card in cardValues"
            :key="card.value"
            class="w-12 h-16 rounded-lg flex flex-col items-center justify-center text-sm font-bold border"
            :class="card.classes"
          >
            <span>{{ card.value }}</span>
            <span class="text-[10px] font-normal opacity-70"
              >×{{ card.count }}</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Setup -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span class="text-2xl">🎬</span> Setup
      </h2>
      <div
        class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5"
      >
        <ol class="space-y-3 text-emerald-300 text-sm">
          <li class="flex gap-3">
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold"
              >1</span
            >
            <span
              >All 150 cards are shuffled and each player is dealt
              <strong class="text-white">12 cards</strong> face-down in a
              <strong class="text-white">3 rows × 4 columns</strong> grid.</span
            >
          </li>
          <li class="flex gap-3">
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold"
              >2</span
            >
            <span
              >The remaining cards form the
              <strong class="text-white">draw pile</strong>. The top card is
              flipped to start the
              <strong class="text-white">discard pile</strong>.</span
            >
          </li>
          <li class="flex gap-3">
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold"
              >3</span
            >
            <span
              >Each player flips <strong class="text-white">2 cards</strong> of
              their choice face-up.</span
            >
          </li>
          <li class="flex gap-3">
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold"
              >4</span
            >
            <span
              >The player with the
              <strong class="text-white">highest sum</strong> of their 2
              revealed cards goes first.</span
            >
          </li>
        </ol>
      </div>
    </section>

    <!-- Turn Actions -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span class="text-2xl">🔄</span> Your Turn
      </h2>
      <p class="text-emerald-300 text-sm mb-4">
        On your turn, you must do <strong class="text-white">one</strong> of the
        following:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Option A -->
        <div
          class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5"
        >
          <h3 class="text-white font-semibold mb-2 flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold"
              >A</span
            >
            Draw from the Pile
          </h3>
          <ol class="space-y-2 text-emerald-300 text-sm">
            <li>Draw the top card from the draw pile and look at it.</li>
            <li class="font-medium text-white">Then choose one:</li>
            <li class="ml-4">
              <strong class="text-emerald-200">Swap</strong> — Replace any card
              in your grid (face-up or face-down). The replaced card goes to the
              discard pile.
            </li>
            <li class="ml-4">
              <strong class="text-emerald-200">Discard</strong> — Put the drawn
              card on the discard pile, then flip one face-down card in your
              grid face-up.
            </li>
          </ol>
        </div>

        <!-- Option B -->
        <div
          class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5"
        >
          <h3 class="text-white font-semibold mb-2 flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-lg bg-amber-600 text-white text-xs flex items-center justify-center font-bold"
              >B</span
            >
            Take from Discard
          </h3>
          <ol class="space-y-2 text-emerald-300 text-sm">
            <li>Pick up the top card from the discard pile.</li>
            <li>
              You <strong class="text-white">must</strong> swap it with one card
              in your grid (face-up or face-down).
            </li>
            <li>The replaced card goes to the discard pile.</li>
          </ol>
          <p class="text-emerald-400/70 text-xs mt-3 italic">
            Tip: Take a discard when you can see it's a low-value card worth
            keeping!
          </p>
        </div>
      </div>
    </section>

    <!-- Column Removal -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span class="text-2xl">✨</span> Column Removal
      </h2>
      <div
        class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5"
      >
        <p class="text-emerald-300 text-sm mb-3">
          If at any point you have
          <strong class="text-white">3 face-up cards of the same value</strong>
          in a vertical column, all 3 cards are
          <strong class="text-yellow-400">removed from the game</strong>!
        </p>
        <div class="flex items-center justify-center gap-6 my-4">
          <div class="flex flex-col items-center gap-1">
            <div
              class="w-10 h-14 rounded bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white font-bold text-sm"
            >
              5
            </div>
            <div
              class="w-10 h-14 rounded bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white font-bold text-sm"
            >
              5
            </div>
            <div
              class="w-10 h-14 rounded bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white font-bold text-sm"
            >
              5
            </div>
          </div>
          <span class="text-3xl text-yellow-400">→</span>
          <div class="flex flex-col items-center gap-1">
            <div
              class="w-10 h-14 rounded border border-dashed border-emerald-700/50 flex items-center justify-center text-emerald-600 text-xl"
            >
              ✕
            </div>
            <div
              class="w-10 h-14 rounded border border-dashed border-emerald-700/50 flex items-center justify-center text-emerald-600 text-xl"
            >
              ✕
            </div>
            <div
              class="w-10 h-14 rounded border border-dashed border-emerald-700/50 flex items-center justify-center text-emerald-600 text-xl"
            >
              ✕
            </div>
          </div>
        </div>
        <p class="text-emerald-400/70 text-xs text-center italic">
          This removes 15 points (3 × 5) from your score — a huge advantage!
        </p>
      </div>
    </section>

    <!-- End of Round -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span class="text-2xl">🏁</span> End of Round
      </h2>
      <div
        class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5 space-y-3 text-emerald-300 text-sm"
      >
        <p>
          A round ends when
          <strong class="text-white"
            >one player has all their cards face-up</strong
          >. Every other player gets
          <strong class="text-white">exactly one more turn</strong>.
        </p>
        <p>
          All remaining face-down cards are then flipped, column removal is
          checked, and each player totals the values of their remaining cards.
        </p>
        <div class="bg-red-900/30 border border-red-700/30 rounded-lg p-4 mt-3">
          <p class="text-red-300 font-semibold mb-1">⚠️ Penalty Rule</p>
          <p class="text-red-300/80">
            If the player who ended the round does
            <strong class="text-white">not</strong> have the strictly lowest
            score <strong class="text-white">and</strong> their score is
            positive, their score is
            <strong class="text-red-400">doubled</strong>!
          </p>
        </div>
      </div>
    </section>

    <!-- End of Game -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span class="text-2xl">🏆</span> End of Game
      </h2>
      <div
        class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5 space-y-3 text-emerald-300 text-sm"
      >
        <p>
          After each round, cumulative scores are updated. The game ends when
          <strong class="text-white"
            >any player's cumulative score reaches 100 or more</strong
          >.
        </p>
        <p>
          The player with the
          <strong class="text-yellow-400">lowest cumulative score</strong> wins!
        </p>
      </div>
    </section>

    <!-- Tips -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-3 flex items-center gap-2">
        <span class="text-2xl">💡</span> Tips
      </h2>
      <div
        class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5"
      >
        <ul class="space-y-2 text-emerald-300 text-sm">
          <li class="flex gap-2">
            <span class="text-yellow-400">•</span>
            <span
              >Try to build matching columns — removing 3 cards eliminates their
              points entirely.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="text-yellow-400">•</span>
            <span
              >Only end a round if you're confident you have the lowest score,
              or the doubling penalty will hurt.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="text-yellow-400">•</span>
            <span
              >Face-down cards are risky — flipping them gives you information
              to make better swaps.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="text-yellow-400">•</span>
            <span
              >Negative cards (-2, -1) and zeros are very valuable — take them
              from the discard whenever possible.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="text-yellow-400">•</span>
            <span
              >Watch your opponents' grids — if they're close to revealing all
              cards, plan your last moves carefully.</span
            >
          </li>
        </ul>
      </div>
    </section>

    <!-- CTA -->
    <div class="text-center pt-4 pb-8">
      <NuxtLink
        to="/play"
        class="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-emerald-900 font-bold px-8 py-3 rounded-xl transition-colors text-lg"
      >
        🃏 Start Playing
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const cardValues = [
  {
    value: -2,
    count: 5,
    classes: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  },
  {
    value: -1,
    count: 10,
    classes: "bg-green-500/20 border-green-500/50 text-green-400",
  },
  {
    value: 0,
    count: 15,
    classes: "bg-green-500/20 border-green-500/50 text-green-400",
  },
  {
    value: 1,
    count: 10,
    classes: "bg-gray-500/20 border-gray-500/50 text-gray-300",
  },
  {
    value: 2,
    count: 10,
    classes: "bg-gray-500/20 border-gray-500/50 text-gray-300",
  },
  {
    value: 3,
    count: 10,
    classes: "bg-gray-500/20 border-gray-500/50 text-gray-300",
  },
  {
    value: 4,
    count: 10,
    classes: "bg-gray-500/20 border-gray-500/50 text-gray-300",
  },
  {
    value: 5,
    count: 10,
    classes: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  },
  {
    value: 6,
    count: 10,
    classes: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  },
  {
    value: 7,
    count: 10,
    classes: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  },
  {
    value: 8,
    count: 10,
    classes: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  },
  {
    value: 9,
    count: 10,
    classes: "bg-red-500/20 border-red-500/50 text-red-400",
  },
  {
    value: 10,
    count: 10,
    classes: "bg-red-500/20 border-red-500/50 text-red-400",
  },
  {
    value: 11,
    count: 10,
    classes: "bg-red-500/20 border-red-500/50 text-red-400",
  },
  {
    value: 12,
    count: 10,
    classes: "bg-red-500/20 border-red-500/50 text-red-400",
  },
];
</script>
