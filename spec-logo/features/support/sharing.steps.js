import { Given, When, Then } from 'cucumber';
import expect from 'expect';
import puppeteer from 'puppeteer';

const port = process.env.PORT || 3000;
export const appPage = `http://localhost:${port}/index.html`;

export async function browseToPageFor(role, url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  this.setPage(role, page);
}

Given('the presenter navigated to the application page', async function () {
  await browseToPageFor.call(this, 'presenter', appPage);
});

Given('the presenter clicked the button {string}', async function (buttonId) {
  await this.getPage('presenter').click(`button#${buttonId}`);
});

When('the observer navigates to the presenter\'s sharing link', async function () {
  await this.getPage('presenter').waitForSelector('a');
  const link = await this.getPage('presenter').$eval('a', a => a.getAttribute('href'));
  const url = new URL(link);
  await browseToPageFor.call(this, 'observer', url);
});

Then('the observer should see a message saying {string}', async function (message) {
  const pageText = await this.getPage('observer').$eval('body', e => e.outerHTML);
  expect(pageText).toContain(message);
});
