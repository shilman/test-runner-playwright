import path from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// @ts-expect-error use _contextReuseMode
export default defineConfig({
  testDir: './src/',
  testMatch: /.stories.ts/,
  // globalSetup: require.resolve('./global.setup.ts'),
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    _contextReuseMode: 'when-possible',
  },

  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: 'setup',
    //   testMatch: /global.setup\.ts/,
    // },
    {
      // dependencies: ['setup'],
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],

  build: {
    // @ts-ignore
    babelPlugins: [[path.join(process.cwd(), 'src', 'csf-plugin.cjs')]],
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm storybook',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: true, //!process.env.CI,
  },
});
