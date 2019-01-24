import React from 'react';
import { useMappedState } from 'redux-react-hook';
const { useCallback, useState, useEffect } = React;

export const Turtle = ({ x, y, angle }) => {
  const buildPoints = (x, y) => `${x - 5},${y + 5}, ${x},${y - 7}, ${x + 5},${y + 5}`;

  const buildRotation = (angle, x, y) => `${angle + 90}, ${x}, ${y}`;

  return <polygon
    points={buildPoints(x, y)}
    fill="green"
    strokeWidth="2"
    stroke="black"
    transform={`rotate(${buildRotation(angle, x, y)})`} />;
};

const isDrawLineCommand = command => command.drawCommand === 'drawLine';

export const Drawing = ({ drawCommands, turtle }) => {

  const lineCommands = drawCommands.filter(isDrawLineCommand);

  return (
    <div id="viewport">
      <svg viewBox="-300 -300 600 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {lineCommands.map(({ id, x1, y1, x2, y2 }) =>
          <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" stroke="black" />)}
        <Turtle {...turtle} />
      </svg>
    </div>
  );
};

export const ReduxConnectedDisplay = () => {
  const mapState = useCallback(({ script: { present: { drawCommands, turtle  } } }) => ({ drawCommands, turtle }), []);

  return <Drawing {...useMappedState(mapState)} />;
};
