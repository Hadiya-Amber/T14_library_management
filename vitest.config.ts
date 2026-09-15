import { defineConfig } from "vitest/config";

// Vitest configuration forcing jsdom environment so tests relying on DOM work
export default defineConfig({
  test: {
    environment: "jsdom",
  },
});
