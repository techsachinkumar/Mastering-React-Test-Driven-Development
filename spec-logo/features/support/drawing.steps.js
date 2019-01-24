import { Given, When, Then } from 'cucumber';
import expect from 'expect';
import { browseToPageFor, appPage } from './browser';
import { checkLinesFromDataTable } from './svg';

Given('the user navigated to the application page', async function () {
  await browseToPageFor.call(this, 'user', appPage);
});

When('the user enters the following instructions at the prompt:', async function (dataTable) {
  for (let instruction of dataTable.raw()) {
    await this.getPage('user').type('textarea', `${instruction}\n`);
  }
  await this.getPage('user').waitFor(3000);
});

Then('these lines should have been drawn in order:', checkLinesFromDataTable('user'));
