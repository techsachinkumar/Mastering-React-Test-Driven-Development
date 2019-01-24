import { Given, When, Then } from 'cucumber';
import expect from 'expect';
import { browseToPageFor, appPage } from './browser';

Given('the user navigated to the application page', async function () {
  await browseToPageFor.call(this, 'user', appPage);
});

When('the user enters the following instructions at the prompt:', async function (dataTable) {
  for (let instruction of dataTable.raw()) {
    await this.getPage('user').type('textarea', `${instruction}\n`);
  }
});

Then('these lines should have been drawn in order:', async function (dataTable) {
  await this.getPage('user').waitFor(3000);
  const lines = await this.getPage('user').$$eval('line', lines =>
    lines.map(line => { return {
      x1: parseFloat(line.getAttribute('x1')),
      y1: parseFloat(line.getAttribute('y1')),
      x2: parseFloat(line.getAttribute('x2')),
      y2: parseFloat(line.getAttribute('y2'))
    }; })
  );
  for (let i = 0; i < lines.length; ++i) {
    expect(lines[i].x1).toBeCloseTo(parseInt(dataTable.hashes()[i].x1));
    expect(lines[i].y1).toBeCloseTo(parseInt(dataTable.hashes()[i].y1));
    expect(lines[i].x2).toBeCloseTo(parseInt(dataTable.hashes()[i].x2));
    expect(lines[i].y2).toBeCloseTo(parseInt(dataTable.hashes()[i].y2));
  }
});
