<template>
  <header
    class="bg-table-dark/80 backdrop-blur border-b border-emerald-700/50 px-4 py-3"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 hover:opacity-80 transition"
      >
        <div
          class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-sm"
        >
          SJ
        </div>
        <span class="text-lg font-semibold text-white">SkyJo</span>
      </NuxtLink>
      <nav class="flex items-center gap-4">
        <NuxtLink
          to="/play"
          class="text-emerald-300 hover:text-white transition text-sm font-medium"
          active-class="text-white"
        >
          Play
        </NuxtLink>
        <NuxtLink
          to="/simulation"
          class="text-emerald-300 hover:text-white transition text-sm font-medium"
          active-class="text-white"
        >
          Simulate
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
