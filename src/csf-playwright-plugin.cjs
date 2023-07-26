"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var template_1 = require("@babel/template");
var csf_1 = require("@storybook/csf");
var describeTemplate = (0, template_1.default)("\n  test.describe(%%title%%, () => {\n    %%body%%\n  });\n");
var testTemplate = (0, template_1.default)("\n  test(%%name%%, async ({ page }) => {\n    const context = { id: %%id%%, title: %%title%%, name: %%name%%, hasPlayFunction: %%hasPlayFunction%% };\n    const storyPage = new StoryPage(page);\n    await storyPage.test(context);\n  });\n");
var makePlaywrightImport = function (t) {
    return t.importDeclaration([t.importSpecifier(t.identifier('test'), t.identifier('test'))], t.stringLiteral('@playwright/test'));
};
var makeFixtureImport = function (t) {
    return t.importDeclaration([t.importSpecifier(t.identifier('StoryPage'), t.identifier('StoryPage'))], t.stringLiteral((0, path_1.join)(__dirname, 'StoryPage')));
};
function default_1(babelContext) {
    var t = babelContext.types;
    return {
        visitor: {
            ExportDefaultDeclaration: {
                enter: function (_a, state) {
                    var node = _a.node;
                    if (t.isObjectExpression(node.declaration)) {
                        var titleProp = node.declaration.properties.find(function (prop) {
                            return t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'title';
                        });
                        if (t.isObjectProperty(titleProp) && t.isStringLiteral(titleProp.value)) {
                            state.title = titleProp.value.value;
                        }
                    }
                },
            },
            ExportNamedDeclaration: {
                enter: function (_a, state) {
                    var node = _a.node;
                    var declarations;
                    if (t.isVariableDeclaration(node.declaration)) {
                        declarations = node.declaration.declarations.filter(function (d) { return t.isVariableDeclarator(d); });
                    }
                    else if (t.isFunctionDeclaration(node.declaration)) {
                        declarations = [node.declaration];
                    }
                    if (declarations) {
                        // export const X = ...;
                        declarations.forEach(function (decl) {
                            if (t.isVariableDeclarator(decl)) {
                                if (t.isIdentifier(decl.id)) {
                                    var exportName = decl.id.name;
                                    var hasPlayFunction = false;
                                    if (t.isObjectExpression(decl.init)) {
                                        var play = decl.init.properties.find(function (prop) {
                                            return t.isObjectProperty(prop) &&
                                                t.isIdentifier(prop.key) &&
                                                prop.key.name === 'play';
                                        });
                                        hasPlayFunction = !!play;
                                    }
                                    state.namedExports[exportName] = hasPlayFunction;
                                }
                            }
                        });
                    }
                    // FIXME: copy full logic from CsfFile
                    return false;
                },
            },
            Program: {
                enter: function (_path, state) {
                    state.namedExports = {};
                },
                exit: function (path, state) {
                    var cwd = state.cwd, filename = state.filename;
                    console.warn('transforming', { cwd: cwd, filename: filename });
                    var title = state.title || (0, path_1.relative)(cwd, filename || (0, path_1.join)(cwd, 'default'));
                    console.log({ title: title });
                    var body = Object.keys(state.namedExports).map(function (name) {
                        var id = (0, csf_1.toId)(title, name);
                        return testTemplate({
                            id: t.stringLiteral(id),
                            title: t.stringLiteral(title),
                            name: t.stringLiteral(name),
                            hasPlayFunction: t.booleanLiteral(state.namedExports[name]),
                        });
                    });
                    path.node.body = [
                        makePlaywrightImport(t),
                        makeFixtureImport(t),
                        describeTemplate({
                            title: t.stringLiteral(title),
                            body: body,
                        }),
                    ];
                    return false;
                },
            },
        },
    };
}
exports.default = default_1;
