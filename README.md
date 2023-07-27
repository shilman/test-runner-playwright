# Storybook Test Runner Playwright

Prototype for reimplementing Storybook's test runner 

## Running the demo

- Install with: `pnpm install`
- Test the storybook with: `pnpm test`

## Developing

- Install with: `pnpm install`
- Run unit tests with: `pnpm run vitest`
- Run storybook with: `pnpm run storybook`
- Test your storybook with: `pnpm test`

If you modify the babel transform in `csf-playwright-plugin.ts`, you might need to:

1. Regenerate the CJS with `pnpm run build-plugin`
2. Figure out where the Playwright cache is located in your machine. For MacOS, it will be inside `/var/folders/{abc}/{xyz}/T/playwright-transform-cache-501`
3. {abc} and {xyz} will be unique in your machine
4. Delete the file cache with e.g.: `rm -rf /var/folders/sg/qcg7xm6s60j7prfmg9hj_kpr0000gn/T/playwright-transform-cache-501`, where the first part of the path is `os.tmpdir()`


To quickly test changes and visualize what is going on, use this (and remember to replace the path):

```
rm -rf {playwright-temporary-dir} && pnpm run build-plugin && PWDEBUG=1 pnpm run test
```