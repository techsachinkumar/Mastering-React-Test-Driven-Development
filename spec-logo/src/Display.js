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

export const StaticLines = ({ lineCommands }) => {
  return lineCommands.map(({ id, x1, y1, x2, y2 }) =>
    <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" stroke="black" />);
};

export const AnimatedLine = ({ commandToAnimate: { x1, y1 }, turtle: { x, y } }) => {
  return <line x1={x1} y1={y1} x2={x} y2={y} strokeWidth="2" stroke="black" />;
};

const isDrawLineCommand = command => command.drawCommand === 'drawLine';
const isRotateCommand = command => command.drawCommand === 'rotate';
const distance = ({ x1, y1, x2, y2 }) => Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
const movementSpeed = 5;
const rotateSpeed = 1000 / 180;

export const Drawing = ({ drawCommands }) => {

  const [ previousDrawCommands, setPreviousDrawCommands ] = useState([]);
  const [ nextCommandToAnimate, setNextCommandToAnimate ] = useState(0);
  const [ turtle, setTurtle ] = useState({ x: 0, y: 0, angle: 0 });

  if (previousDrawCommands != drawCommands) {
    if (drawCommands.length === 0) {
      setTurtle({ x: 0, y: 0, angle: 0 });
    }
    setPreviousDrawCommands(drawCommands);
    setNextCommandToAnimate(previousDrawCommands.length);
  }

  const lineCommands = drawCommands.slice(0, nextCommandToAnimate)
    .filter(isDrawLineCommand);

  const commandToAnimate = drawCommands[nextCommandToAnimate];
  const isDrawingLine = commandToAnimate && isDrawLineCommand(commandToAnimate);
  const isRotating = commandToAnimate && isRotateCommand(commandToAnimate);

  useEffect(() => {
    let start;
    let duration;

    const handleDrawLineFrame = (time) => {
      if (start === undefined) start = time;
      if (time < start + duration) {
        const elapsed = time - start;
        const { x1, x2, y1, y2 } = commandToAnimate;
        setTurtle(turtle => ({
          ...turtle,
          x: x1 + ((x2 - x1) * (elapsed / duration)),
          y: y1 + ((y2 - y1) * (elapsed / duration)),
        }));
        requestAnimationFrame(handleDrawLineFrame);
      } else {
        setNextCommandToAnimate(nextCommandToAnimate + 1);
      }
    };

    const handleRotationFrame = (time) => {
      if (start === undefined) start = time;
      if (time < start + duration) {
        const elapsed = time - start;
        const { previousAngle, newAngle } = commandToAnimate;
        setTurtle(turtle => ({
          ...turtle,
          angle: previousAngle + (newAngle - previousAngle) * (elapsed / duration)
        }));
        requestAnimationFrame(handleRotationFrame);
      } else {
        setTurtle(turtle => ({
          ...turtle,
          angle: commandToAnimate.newAngle
        }));
        setNextCommandToAnimate(nextCommandToAnimate + 1);
      }
    };

    if (isDrawingLine) {
      duration = movementSpeed * distance(commandToAnimate);
      requestAnimationFrame(handleDrawLineFrame);
    } else if (isRotating) {
      duration = rotateSpeed * Math.abs(commandToAnimate.newAngle - turtle.angle);
      requestAnimationFrame(handleRotationFrame);
    }
  }, [nextCommandToAnimate, drawCommands]);

  return (
    <div id="viewport">
      <svg viewBox="-300 -300 600 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <StaticLines lineCommands={lineCommands} />
        { isDrawingLine ? <AnimatedLine commandToAnimate={commandToAnimate} turtle={turtle} /> : null }
        <Turtle {...turtle} />
      </svg>
    </div>
  );
};

export const ReduxConnectedDisplay = () => {
  const mapState = useCallback(({ script: { present: { drawCommands } } }) => ({ drawCommands }), []);

  return <Drawing {...useMappedState(mapState)} />;
};
