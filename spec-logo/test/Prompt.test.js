import React from 'react';
import { expectRedux } from 'expect-redux';
import { createContainerWithStore } from './domManipulators';
import { Prompt } from '../src/Prompt';

describe('Prompt', () => {
  let container, renderWithStore, change, keyPress;

  beforeEach(() => {
    ({
      container,
      renderWithStore,
      change,
      keyPress
    } = createContainerWithStore());
  });

  const renderInTableWithStore = component =>
    renderWithStore(<table>{component}</table>);

  it('renders a tbody', () => {
    renderInTableWithStore(<Prompt />);
    expect(container.querySelector('tbody')).not.toBeNull();
  });

  it('renders a table cell with a prompt indicator as the first cell in each row', () => {
    renderInTableWithStore(<Prompt />);
    const td = container.querySelectorAll('tr')[0].childNodes[0];
    expect(td.textContent).toEqual('>');
    expect(td.className).toContain('promptIndicator');
  });

  const textArea = () =>
    container.querySelectorAll('tr')[0].childNodes[1]
      .childNodes[0];

  it('renders a table cell with an empty textarea', () => {
    renderInTableWithStore(<Prompt />);
    expect(textArea().tagName).toEqual('TEXTAREA');
    expect(textArea().value).toEqual('');
  });

  it('sets the textarea text to initially have a height of 20', () => {
    renderInTableWithStore(<Prompt />);
    expect(textArea().getAttribute('style')).toEqual(
      'height: 20px;'
    );
  });

  it('dispatches an action with the updated edit line when the user hits enter on the text field', () => {
    const line = 'repeat 4\n[ forward 10 right 90 ]\n';
    const store = renderInTableWithStore(<Prompt />);
    keyPress(textArea(), { key: 'Enter' });
    change(textArea(), { target: { value: line } });
    return expectRedux(store)
      .toDispatchAnAction()
      .matching({ type: 'SUBMIT_EDIT_LINE', text: line });
  });

  describe('instruction id increments after submitting edit line', () => {
    beforeEach(() => {
      renderInTableWithStore(<Prompt />);
      keyPress(textArea(), { key: 'Enter' });
      change(textArea(), { target: { value: 'forward 10\n' } });
    });

    it('blanks the edit field', () => {
      expect(textArea().value).toEqual('');
    });
  });
});
