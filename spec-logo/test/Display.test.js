import React from 'react';
import ReactDOM from 'react-dom';
import { mount, shallow } from 'enzyme';
import { StoreContext } from 'redux-react-hook';
import { expectRedux, storeSpy } from 'expect-redux';
import { configureStore } from '../src/store';
import { Turtle, AnimatedLine, StaticLines, Drawing, ReduxConnectedDisplay } from '../src/Display';

const horizontalLine = { drawCommand: 'drawLine', id: 123, x1: 100, y1: 100, x2: 200, y2: 100 };
const verticalLine = { drawCommand: 'drawLine', id: 234, x1: 200, y1: 100, x2: 200, y2: 200 };
const diagonalLine = { drawCommand: 'drawLine', id: 235, x1: 200, y1: 200, x2: 300, y2: 300 };
let rotate90 = { drawCommand: 'rotate', id: 456, angle: 90 };
const turtle = { x: 0, y: 0, angle: 0 };

function mountSvg(component) {
  return mount(<svg>{component}</svg>);
}

describe('Turtle', () => {
  let wrapper;

  function polygon() {
    return wrapper.find('polygon');
  }

  it('draws a polygon at the x,y co-ordinate', () => {
    wrapper = mountSvg(<Turtle x={10} y={10} angle={10} />)
    expect(polygon().exists()).toBeTruthy();
    expect(polygon().prop('points')).toEqual('5,15, 10,3, 15,15');
  });

  it('sets a stroke width of 2', () => {
    wrapper = mountSvg(<Turtle x={10} y={10} angle={10} />)
    expect(polygon().prop('strokeWidth')).toEqual('2');
  });

  it('sets a stroke color of black', () => {
    wrapper = mountSvg(<Turtle x={10} y={10} angle={10} />)
    expect(polygon().prop('stroke')).toEqual('black');
  });

  it('sets a fill of green', () => {
    wrapper = mountSvg(<Turtle x={10} y={10} angle={10} />)
    expect(polygon().prop('fill')).toEqual('green');
  });

  it('sets a transform with the angle', () => {
    wrapper = mountSvg(<Turtle x={10} y={20} angle={30} />)
    expect(polygon().prop('transform')).toEqual('rotate(120, 10, 20)');
  });
});

describe('Drawing', () => {
  let wrapper;

  function svg() {
    return wrapper.find('svg');
  }

  function line() {
    return wrapper.find('line');
  }

  it('renders an svg inside div#viewport', () => {
    wrapper = mount(<Drawing drawCommands={[]} turtle />);
    expect(wrapper.find('div#viewport > svg').exists()).toBeTruthy();
  });

  it('sets a viewbox of +/- 300 in either axis and preserves aspect ratio', () => {
    wrapper = mount(<Drawing drawCommands={[]} turtle />);
    expect(svg().exists()).toBeTruthy();
    expect(svg().prop('viewBox')).toEqual('-300 -300 600 600');
    expect(svg().prop('preserveAspectRatio')).toEqual('xMidYMid slice');
  });

  it('renders a line with the line coordinates', () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine ]} turtle />);
    expect(line().exists()).toBeTruthy();
    expect(line().containsMatchingElement(
      <line x1={100} y1={100} x2={200} y2={100} />)).toBeTruthy();
  });

  it('sets a stroke width of 2', () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine ]} turtle />);
    expect(line().prop('strokeWidth')).toEqual('2');
  });

  it('sets a stroke color of black', () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine ]} turtle />);
    expect(line().prop('stroke')).toEqual('black');
  });

  it('draws every drawLine command', () => {
    wrapper = mount(<Drawing drawCommands={ [ horizontalLine, verticalLine, diagonalLine ] } turtle />);
    expect(line().length).toEqual(3);
  });

  it('does not draw any commands for non-drawLine commands', () => {
    const unknown = { drawCommand: 'unknown' };
    wrapper = mount(<Drawing drawCommands={[ unknown ]} turtle />);
    expect(line().length).toEqual(0);
  });

  it('renders a Turtle at the current turtle position', async () => {
    wrapper = mount(<Drawing drawCommands={[]} turtle={ { x: 10, y: 20, angle: 30 } } />);
    expect(wrapper.find('Turtle').prop('x')).toEqual(10);
    expect(wrapper.find('Turtle').prop('y')).toEqual(20);
    expect(wrapper.find('Turtle').prop('angle')).toEqual(30);
  });
});

describe('ReduxConnectedDisplay', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = configureStore([storeSpy], { script: {
      drawCommands: [
        horizontalLine, verticalLine
      ]
    }});
  });

  function mountWithStore(component) {
    return mount(<StoreContext.Provider value={store}>{component}</StoreContext.Provider>);
  }

  it('renders a Drawing with drawCommands as props', () => {
    wrapper = mountWithStore(<ReduxConnectedDisplay />);
    expect(wrapper.find('Drawing').exists()).toBeTruthy();
    expect(wrapper.find('Drawing').prop('drawCommands')).toEqual([ horizontalLine, verticalLine ]);
  });
});
