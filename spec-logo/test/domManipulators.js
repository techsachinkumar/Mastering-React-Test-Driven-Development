import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils, { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { storeSpy } from 'expect-redux';
import { configureStore } from '../src/store';

export const createContainer = () => {
  const container = document.createElement('div');

  const form = id => container.querySelector(`form[id="${id}"]`);
  const field = (formId, name) => form(formId).elements[name];
  const labelFor = formElement =>
    container.querySelector(`label[for="${formElement}"]`);

  const element = selector => container.querySelector(selector);
  const elements = selector =>
    Array.from(container.querySelectorAll(selector));

  const simulateEvent = eventName => (element, eventData) =>
    act(() => {
      ReactTestUtils.Simulate[eventName](element, eventData);
    });

  const children = element => Array.from(element.childNodes);

  return {
    render: component =>
      act(() => {
        ReactDOM.render(component, container);
      }),
    renderAndWait: async component => {
      act(() => {
        ReactDOM.render(component, container);
      });
      await waitForCurrentQueueToFlush();
    },
    clickAndWait: async element => {
      simulateEvent('click')(element);
      await waitForCurrentQueueToFlush();
    },
    container,
    form,
    field,
    labelFor,
    element,
    elements,
    children,
    blur: simulateEvent('blur'),
    click: simulateEvent('click'),
    change: simulateEvent('change'),
    focus: simulateEvent('focus'),
    keyPress: simulateEvent('keyPress'),
    submit: simulateEvent('submit')
  };
};

export const createContainerWithStore = () => {
  const container = createContainer();
  return {
    ...container,
    renderWithStore: (component, initialState = {}) => {
      const store = configureStore([storeSpy], initialState);
      act(() => {
        ReactDOM.render(
          <Provider store={store}>{component}</Provider>,
          container.container
        );
      });
      return store;
    }
  };
};

export const withEvent = (name, value) => ({
  target: { name, value }
});

export const waitForCurrentQueueToFlush = () =>
  new Promise(setTimeout);
