import puppeteer from 'puppeteer';

const port = process.env.PORT || 3000;

export const appPage = `http://localhost:${port}/index.html`;

export async function browseToPageFor(role, url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  this.setPage(role, page);
}
