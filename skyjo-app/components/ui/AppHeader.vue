<template>
  <header
    class="bg-table-dark/80 backdrop-blur border-b border-indigo-700/50 px-4 py-3"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 hover:opacity-80 transition"
      >
        <img
          src="/favicon.svg"
          alt="SkyJo"
          class="w-8 h-8 rounded-lg"
        />
        <span class="text-lg font-semibold text-white">SkyJo</span>
      </NuxtLink>
      <nav class="flex items-center gap-4">
        <NuxtLink
          to="/play"
          class="text-indigo-300 hover:text-white transition text-sm font-medium"
          active-class="text-white"
        >
          Play
        </NuxtLink>
        <NuxtLink
          to="/instructions"
          class="text-indigo-300 hover:text-white transition text-sm font-medium"
          active-class="text-white"
        >
          Rules
        </NuxtLink>
        <NuxtLink
          to="/strategies"
          class="text-indigo-300 hover:text-white transition text-sm font-medium"
          active-class="text-white"
        >
          Strategies
        </NuxtLink>
        <NuxtLink
          to="/simulation"
          class="text-indigo-300 hover:text-white transition text-sm font-medium"
          active-class="text-white"
        >
          Simulate
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
