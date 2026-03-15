import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  const animationSpeed = ref(1.0);
  const soundEnabled = ref(false);
  const theme = ref<"dark" | "light">("dark");

  // Load from localStorage
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("skyjo-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.animationSpeed !== undefined)
          animationSpeed.value = parsed.animationSpeed;
        if (parsed.soundEnabled !== undefined)
          soundEnabled.value = parsed.soundEnabled;
        if (parsed.theme !== undefined) theme.value = parsed.theme;
      } catch {}
    }
  }

  function save() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "skyjo-settings",
        JSON.stringify({
          animationSpeed: animationSpeed.value,
          soundEnabled: soundEnabled.value,
          theme: theme.value,
        }),
      );
    }
  }

  watch([animationSpeed, soundEnabled, theme], save, { deep: true });

  return {
    animationSpeed,
    soundEnabled,
    theme,
  };
});
