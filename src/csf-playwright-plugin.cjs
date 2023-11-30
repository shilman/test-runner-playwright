"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var template_1 = require("@babel/template");
var csf_tools_1 = require("@storybook/csf-tools");
var describeTemplate = (0, template_1.default)("\n  test.describe(%%title%%, () => {\n    %%body%%\n  });\n");
var testTemplate = (0, template_1.default)("\n  test(%%name%%, async ({ page }) => {\n    const context = { id: %%id%%, title: %%title%%, name: %%name%% };\n    const storyPage = new StoryPage(page);\n    await storyPage.test(context);\n  });\n");
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
            Program: {
                enter: function (path, state) {
                    var filename = state.filename;
                    // FIXME: this makes use of a loophole that both
                    // CsfFile and Playwright Test are using babel!
                    // In the future, this probably won't be the case.
                    //
                    // @ts-expect-error parent file is not typed
                    var csf = new csf_tools_1.CsfFile(path.parent, {
                        fileName: filename,
                        makeTitle: function (userTitle) { return userTitle || 'default'; },
                    }).parse();
                    var title = csf.meta.title;
                    console.log({ title: title });
                    var body = csf.stories.map(function (story) {
                        var id = story.id;
                        var name = story.name;
                        return testTemplate({
                            id: t.stringLiteral(id),
                            title: t.stringLiteral(title),
                            name: t.stringLiteral(name),
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
