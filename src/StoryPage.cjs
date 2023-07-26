const { expect } = require('@playwright/test');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class StoryPage {
  constructor(page) {
    this.page = page;
  }
  async test(context) {
    this.page.on('pageerror', (err) => {
      console.log('received pagerror');
      page.evaluate(({ id, err }) => __throwError(id, err), { id: context.id, err: err.message });
    });
    await this.page.goto(`http://localhost:6006/iframe.html?args=&id=${context.id}`);
    await this.page.evaluate(({ id, hasPlayFn }) => __test(id, hasPlayFn), context);
    await sleep(10000000);
  }
}

module.exports = { StoryPage };
