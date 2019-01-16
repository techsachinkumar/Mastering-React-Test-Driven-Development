import React from 'react';
import ReactDOM from 'react-dom';
import { mount, shallow } from 'enzyme';
import { StoreContext } from 'redux-react-hook';
import { expectRedux, storeSpy } from 'expect-redux';
import { configureStore } from '../src/store';
import { AnimatedLine, StaticLines, Turtle, Drawing, ReduxConnectedDisplay } from '../src/Display';

const horizontalLine = { drawCommand: 'drawLine', id: 123, x1: 100, y1: 100, x2: 200, y2: 100 };
const verticalLine = { drawCommand: 'drawLine', id: 234, x1: 200, y1: 100, x2: 200, y2: 200 };
const diagonalLine = { drawCommand: 'drawLine', id: 235, x1: 200, y1: 200, x2: 300, y2: 300 };
const rotate90 = { drawCommand: 'rotate', id: 456, previousAngle: 0, newAngle: 90 };
const turtle = { x: 0, y: 0, angle: 0 };

function mountSvg(component) {
  return mount(<svg>{component}</svg>);
}

describe('StaticLines', () => {
  let wrapper;

  function line() {
    return wrapper.find('line');
  }

  it('renders a line with the line coordinates', () => {
    wrapper = mountSvg(<StaticLines lineCommands={[ horizontalLine ]} />);
    expect(line().exists()).toBeTruthy();
    expect(line().containsMatchingElement(
      <line x1={100} y1={100} x2={200} y2={100} />)).toBeTruthy();
  });

  it('sets a stroke width of 2', () => {
    wrapper = mountSvg(<StaticLines lineCommands={[ horizontalLine ]} />);
    expect(line().prop('strokeWidth')).toEqual('2');
  });

  it('sets a stroke color of black', () => {
    wrapper = mountSvg(<StaticLines lineCommands={[ horizontalLine ]} />);
    expect(line().prop('stroke')).toEqual('black');
  });

  it('draws every drawLine command', () => {
    wrapper = mountSvg(<StaticLines lineCommands={ [ horizontalLine, verticalLine, diagonalLine ] } />);
    expect(line().length).toEqual(3);
  });
});

describe('AnimatedLine', () => {
  let wrapper;

  function line() {
    return wrapper.find('line');
  }

  it('draws a line starting at the x1,y1 co-ordinate of the command being drawn', () => {
    wrapper = mountSvg(<AnimatedLine commandToAnimate={horizontalLine} turtle={ { } } />)
    expect(line().exists()).toBeTruthy();
    expect(line().prop('x1')).toEqual(horizontalLine.x1);
    expect(line().prop('y1')).toEqual(horizontalLine.y1);
  });

  it('draws a line ending at the current position of the turtle', () => {
    wrapper = mountSvg(<AnimatedLine commandToAnimate={horizontalLine} turtle={ { x: 10, y: 20 } } />)
    expect(line().prop('x2')).toEqual(10);
    expect(line().prop('y2')).toEqual(20);
  });

  it('sets a stroke width of 2', () => {
    wrapper = mountSvg(<AnimatedLine commandToAnimate={horizontalLine} turtle={ { } } />)
    expect(line().prop('strokeWidth')).toEqual('2');
  });

  it('sets a stroke color of black', () => {
    wrapper = mountSvg(<AnimatedLine commandToAnimate={horizontalLine} turtle={ { } } />)
    expect(line().prop('stroke')).toEqual('black');
  });
});

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
  let requestAnimationFrameSpy;

  beforeEach(() => {
    requestAnimationFrameSpy = jest.fn();
    window.requestAnimationFrame = requestAnimationFrameSpy;
  });

  function svg() {
    return wrapper.find('svg');
  }

  function line() {
    return wrapper.find('line');
  }

  function triggerRequestAnimationFrame(time) {
    const lastCall = requestAnimationFrameSpy.mock.calls.length - 1;
    const frameFn = requestAnimationFrameSpy.mock.calls[lastCall][0];
    frameFn(time);
  }

  it('renders an svg inside div#viewport', () => {
    wrapper = mount(<Drawing drawCommands={[]} />);
    expect(wrapper.find('div#viewport > svg').exists()).toBeTruthy();
  });

  it('sets a viewbox of +/- 300 in either axis and preserves aspect ratio', () => {
    wrapper = mount(<Drawing drawCommands={[]} />);
    expect(svg().exists()).toBeTruthy();
    expect(svg().prop('viewBox')).toEqual('-300 -300 600 600');
    expect(svg().prop('preserveAspectRatio')).toEqual('xMidYMid slice');
  });

  it('does not draw any commands for non-drawLine commands', () => {
    const unknown = { drawCommand: 'unknown' };
    wrapper = mount(<Drawing drawCommands={[ unknown ]} />);
    expect(line().length).toEqual(0);
  });

  it('initially renders a Turtle at the origin', () => {
    wrapper = mount(<Drawing drawCommands={[]} />);
    expect(wrapper.find('Turtle').prop('x')).toEqual(0);
    expect(wrapper.find('Turtle').prop('y')).toEqual(0);
    expect(wrapper.find('Turtle').prop('angle')).toEqual(0);
  });

  it('sends all previous commands to StaticLines', () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine, verticalLine ]} />);
    wrapper.setProps({ drawCommands: [ horizontalLine, verticalLine, diagonalLine ] });
    expect(wrapper.find('StaticLines').exists()).toBeTruthy();
    expect(wrapper.find('StaticLines').prop('lineCommands')).toEqual([ horizontalLine, verticalLine ]);
  });

  it('invokes requestAnimationFrame when the timeout fires', async () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine ]} />);
    await new Promise(setTimeout);
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
  });

  it('renders an AnimatedLine with turtle at the start position when the animation has run for 0s', async () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine ]} />);
    await new Promise(setTimeout);
    triggerRequestAnimationFrame(0);
    wrapper = wrapper.update();
    expect(wrapper.find('AnimatedLine').exists()).toBeTruthy();
    expect(wrapper.find('AnimatedLine').prop('commandToAnimate')).toEqual(horizontalLine);
    expect(wrapper.find('AnimatedLine').prop('turtle')).toEqual({ x: 100, y: 100, angle: 0 });
  });

  it('renders an AnimatedLine with turtle at a position based on a speed of 5px per ms', async () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine ]} />);
    await new Promise(setTimeout);
    triggerRequestAnimationFrame(0);
    triggerRequestAnimationFrame(250);
    wrapper = wrapper.update();
    expect(wrapper.find('AnimatedLine').prop('commandToAnimate')).toEqual(horizontalLine);
    expect(wrapper.find('AnimatedLine').prop('turtle')).toEqual({ x: 150, y: 100, angle: 0 });
  });

  it('invokes requestAnimationFrame repeatedly until the duration is reached', async () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine ]} />);
    await new Promise(setTimeout);
    triggerRequestAnimationFrame(0);
    triggerRequestAnimationFrame(250);
    triggerRequestAnimationFrame(500);
    expect(requestAnimationFrameSpy.mock.calls.length).toEqual(3);
  });

  it('moves to the next command once drawing is complete', async () => {
    wrapper = mount(<Drawing drawCommands={[ horizontalLine, verticalLine ]} />);
    await new Promise(setTimeout);
    triggerRequestAnimationFrame(0);
    triggerRequestAnimationFrame(500);
    await new Promise(setTimeout);
    triggerRequestAnimationFrame(0);
    triggerRequestAnimationFrame(250);
    wrapper = wrapper.update();
    expect(wrapper.find('AnimatedLine').prop('turtle')).toEqual({ x: 200, y: 150, angle: 0 });
  });

  describe('rotation', () => {
    it('rotates the turtle', async () => {
      wrapper = mount(<Drawing drawCommands={[ rotate90 ]} />);
      await new Promise(setTimeout);
      triggerRequestAnimationFrame(0);
      triggerRequestAnimationFrame(500);
      await new Promise(setTimeout);
      wrapper = wrapper.update();
      expect(wrapper.find('Turtle').prop('x')).toEqual(0);
      expect(wrapper.find('Turtle').prop('y')).toEqual(0);
      expect(wrapper.find('Turtle').prop('angle')).toEqual(90);
    });

    it('rotates part-way at a speed of 1s per 180 degrees', async () => {
      wrapper = mount(<Drawing drawCommands={[ rotate90 ]} />);
      await new Promise(setTimeout);
      triggerRequestAnimationFrame(0);
      triggerRequestAnimationFrame(250);
      wrapper = wrapper.update();
      expect(wrapper.find('Turtle').prop('x')).toEqual(0);
      expect(wrapper.find('Turtle').prop('y')).toEqual(0);
      expect(wrapper.find('Turtle').prop('angle')).toEqual(45);
    });

    it('invokes requestAnimationFrame repeatedly until the duration is reached', async () => {
      wrapper = mount(<Drawing drawCommands={[ rotate90 ]} />);
      await new Promise(setTimeout);
      triggerRequestAnimationFrame(0);
      triggerRequestAnimationFrame(250);
      triggerRequestAnimationFrame(500);
      expect(requestAnimationFrameSpy.mock.calls.length).toEqual(3);
    });

    it('moves to the next command once rotation is complete', async () => {
      wrapper = mount(<Drawing drawCommands={[ rotate90, horizontalLine ]} />);
      await new Promise(setTimeout);
      triggerRequestAnimationFrame(0);
      triggerRequestAnimationFrame(500);
      await new Promise(setTimeout);
      triggerRequestAnimationFrame(0);
      triggerRequestAnimationFrame(250);
      wrapper = wrapper.update();
      expect(wrapper.find('AnimatedLine').prop('turtle')).toEqual({ x: 150, y: 100, angle: 90 });
    });
  });
});

describe('ReduxConnectedDisplay', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = configureStore([storeSpy], { script: { present: {
      drawCommands: [
        horizontalLine, verticalLine
      ]
    }}});
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
