import { defineConfig, devices } from "@playwright/test";

// E2E runs against a local production build + the local Docker database.
const PORT = 3100;
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://gift:giftpass@localhost:5433/giftshop";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL,
      NEXT_PUBLIC_STORE_NAME: "Divs Aesthetix",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "917358978687",
      ADMIN_PASSWORD: "kundima123",
      SESSION_SECRET: "test-secret",
    },
  },
});
