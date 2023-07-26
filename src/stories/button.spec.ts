import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(
    'http://localhost:6006/iframe.html?args=&id=example-button--primary&viewMode=story'
  );
});

test.describe('Button', () => {
  test('hello', async ({ page }) => {
    await page.waitForSelector('text=Button');
  });
});
