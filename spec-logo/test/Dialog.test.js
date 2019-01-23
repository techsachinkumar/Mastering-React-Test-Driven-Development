import React from 'react';
import { mount } from 'enzyme';
import { Dialog } from '../src/Dialog';

describe('Dialog', () => {
  let wrapper;
  let onChooseSpy;
  let onCloseSpy;

  beforeEach(() => {
    onChooseSpy = jest.fn();
    onCloseSpy = jest.fn();
  });

  function mountDialog(props) {
    return mount(<Dialog
      message={"Hello"}
      buttons={[]}
      onChoose={onChooseSpy}
      onClose={onCloseSpy}
      {...props} />);
  }

  it('renders a div with className dialog', () => {
    wrapper = mountDialog();
    expect(wrapper.find('div.dialog').exists()).toBeTruthy();
  });

  it('renders message in a paragraph element', () => {
    wrapper = mountDialog({ message: 'This is a message' });
    expect(wrapper.find('p').exists()).toBeTruthy();
    expect(wrapper.find('p').text()).toEqual('This is a message');
  });

  it('renders a div with className dialogButtons inside dialog', () => {
    wrapper = mountDialog();
    expect(wrapper.find('div.dialog > div.dialogButtons').exists()).toBeTruthy();
  });

  it('renders button properties', () => {
    wrapper = mountDialog({ buttons: [{ id: 'yes', text: 'Yes' }] });
    expect(wrapper.find('button').prop('id')).toEqual('yes');
    expect(wrapper.find('button').text()).toEqual('Yes');
  });

  it('renders all buttons inside the dialogButtons div', () => {
    wrapper = mountDialog({ buttons: [
      { id: 'yes', text: 'Yes' },
      { id: 'no', text: 'No' } ] });
    const buttons = wrapper.find('div.dialogButtons > button');
    expect(buttons.length).toEqual(2);
    expect(buttons.map(button => button.prop('id'))).toEqual(['yes', 'no']);
  });

  it('calls onChoose with the button id when it is clicked', () => {
    wrapper = mountDialog({ buttons: [
      { id: 'yes', text: 'Yes' },
      { id: 'no', text: 'No' } ] });
    wrapper.find('button#yes').simulate('click');
    expect(onChooseSpy).toHaveBeenCalledWith('yes');
  });

  it('calls onClose when a butotn is clicked', () => {
    wrapper = mountDialog({ buttons: [
      { id: 'yes', text: 'Yes' },
      { id: 'no', text: 'No' } ] });
    wrapper.find('button#yes').simulate('click');
    expect(onCloseSpy).toHaveBeenCalled();
  });
});
