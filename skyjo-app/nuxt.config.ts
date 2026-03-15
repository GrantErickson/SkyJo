export default defineNuxtConfig({
  ssr: false,
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  compatibilityDate: "2025-01-01",
  app: {
    head: {
      title: "SkyJo",
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
      meta: [
        {
          name: "description",
          content: "Play SkyJo card game against AI opponents",
        },
      ],
    },
  },
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },
});
