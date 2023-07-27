import { relative, join } from 'path';
import type { PluginObj, PluginPass } from '@babel/core';
import type * as T from '@babel/types';
import template from '@babel/template';
import { toId } from '@storybook/csf';

const describeTemplate = template(`
  test.describe(%%title%%, () => {
    %%body%%
  });
`);

const testTemplate = template(`
  test(%%name%%, async ({ page }) => {
    const context = { id: %%id%%, title: %%title%%, name: %%name%%, hasPlayFunction: %%hasPlayFunction%% };
    const storyPage = new StoryPage(page);
    await storyPage.test(context);
  });
`);

// const oldTestTemplate = template(`
//   import { test } from '@playwright/test';

//   test.beforeEach(async ({ page }) => {
//     await page.goto(
//       'http://localhost:6006/iframe.html?args=&id='+%%id%%
//     );
//   });

//   test.describe('Button', () => {
//     test('hello', async ({ page }) => {
//       await page.waitForSelector('text=Button');
//     });
//   });
// `);

// const output = `
// import { test } from '@playwright/test';

// test.beforeEach(async ({ page }) => {
//   await page.goto(
//     'http://localhost:6006/iframe.html?args=&id=example-button--primary&viewMode=story'
//   );
// });

// test.describe('Button', () => {
//   test('hello', async ({ page }) => {
//     await page.waitForSelector('text=Button');
//   });
// });
// `;

type BabelTypes = typeof T;
interface CustomState extends PluginPass {
  title?: string;
  namedExports?: Record<string, boolean>;
}

const makePlaywrightImport = (t: BabelTypes) =>
  t.importDeclaration(
    [t.importSpecifier(t.identifier('test'), t.identifier('test'))],
    t.stringLiteral('@playwright/test')
  );

const makeFixtureImport = (t: BabelTypes) =>
  t.importDeclaration(
    [t.importSpecifier(t.identifier('StoryPage'), t.identifier('StoryPage'))],
    t.stringLiteral(join(__dirname, 'StoryPage'))
  );

export default function (babelContext: { types: BabelTypes }): PluginObj {
  const { types: t } = babelContext;

  return {
    visitor: {
      ExportDefaultDeclaration: {
        enter(path, state: CustomState) {
          const { node } = path;
          let meta: T.Node = node.declaration;
          if (t.isIdentifier(meta)) {
            const binding = path.scope.getBinding(meta.name);
            if (binding && t.isVariableDeclarator(binding.path.node)) {
              meta = binding.path.node.init as T.Node;
            }
          }
          if (t.isTSSatisfiesExpression(meta) || t.isTSAsExpression(meta)) {
            meta = meta.expression;
          }
          if (t.isObjectExpression(meta)) {
            const titleProp = meta.properties.find(
              (prop) =>
                t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'title'
            );
            if (t.isObjectProperty(titleProp) && t.isStringLiteral(titleProp.value)) {
              state.title = titleProp.value.value;
            }
          }
        },
      },
      ExportNamedDeclaration: {
        enter({ node }, state: CustomState) {
          let declarations;
          if (t.isVariableDeclaration(node.declaration)) {
            declarations = node.declaration.declarations.filter((d) => t.isVariableDeclarator(d));
          } else if (t.isFunctionDeclaration(node.declaration)) {
            declarations = [node.declaration];
          }
          if (declarations) {
            // export const X = ...;
            declarations.forEach((decl) => {
              if (t.isVariableDeclarator(decl)) {
                if (t.isIdentifier(decl.id)) {
                  const { name: exportName } = decl.id;
                  let hasPlayFunction = false;
                  if (t.isObjectExpression(decl.init)) {
                    const play = decl.init.properties.find(
                      (prop) =>
                        t.isObjectProperty(prop) &&
                        t.isIdentifier(prop.key) &&
                        prop.key.name === 'play'
                    );
                    hasPlayFunction = !!play;
                  }
                  state.namedExports![exportName] = hasPlayFunction;
                }
              }
            });
          }
          // FIXME: copy full logic from CsfFile
          return false;
        },
      },
      Program: {
        enter(_path, state) {
          state.namedExports = {};
        },
        exit(path, state: CustomState) {
          const { cwd, filename } = state;
          console.warn('transforming', { cwd, filename });
          // TODO: if we ever wanted to add global-setup from the "projects" field of playwright.config, we need to skip transforming it
          // as it is treated as a test as well.
          // if (filename === null || filename.includes('global.setup')) {
          //     return;
          // }
          const title =
            state.title ||
            relative(join(cwd, 'src'), filename || join(cwd, 'default')).replace(
              /\.stories\.(.*)?$/,
              ''
            );
          console.log({ title });
          const body = Object.keys(state.namedExports!).map((name) => {
            const id = toId(title, name);
            return testTemplate({
              id: t.stringLiteral(id),
              title: t.stringLiteral(title),
              name: t.stringLiteral(name),
              hasPlayFunction: t.booleanLiteral(state.namedExports![name]),
            });
          });
          path.node.body = [
            makePlaywrightImport(t),
            makeFixtureImport(t),
            describeTemplate({
              title: t.stringLiteral(title),
              body,
            }) as T.Statement,
          ];
          return false;
        },
      },
    },
  };
}
