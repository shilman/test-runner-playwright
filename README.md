# Storybook Test Runner Playwright

Prototype for reimplementing Storybook's test runner 

## Running the demo

- Test your storybook with: `pnpm test`

## Developing

- Run unit tests with: `pnpm run vitest`
- Run storybook with: `pnpm run storybook`
- Test your storybook with: `pnpm test`

If you modify the babel transform in `csf-playwright-plugin.ts`, you might need to:

1. Regenerate the CJS with `pnpm run build-plugin`
2. Delete the file cache with: `trash /var/folders/sg/qcg7xm6s60j7prfmg9hj_kpr0000gn/T/playwright-transform-cache-501`, where the first part of the path is `os.tmpdir()`

