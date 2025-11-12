import React from 'react';
import { Circle, Path } from 'react-native-svg';
import { Ball } from '../../types';

interface BallIconProps {
  ball: Ball;
  selected?: boolean;
  size?: number;
}

const BallIcon: React.FC<BallIconProps> = ({ ball, selected = false, size = 20 }) => {
  const radius = size / 2;

  // Simple football pattern (pentagon pattern)
  const pentagonPath = `
    M ${ball.x},${ball.y - radius * 0.6}
    L ${ball.x + radius * 0.3},${ball.y - radius * 0.2}
    L ${ball.x + radius * 0.5},${ball.y + radius * 0.4}
    L ${ball.x - radius * 0.5},${ball.y + radius * 0.4}
    L ${ball.x - radius * 0.3},${ball.y - radius * 0.2}
    Z
  `;

  return (
    <>
      <Circle
        cx={ball.x}
        cy={ball.y}
        r={radius}
        fill="#FFFFFF"
        stroke={selected ? '#FF0000' : '#000000'}
        strokeWidth={selected ? 3 : 2}
      />
      <Path
        d={pentagonPath}
        fill="#000000"
        stroke="none"
      />
      {/* Additional pattern lines */}
      <Path
        d={`M ${ball.x - radius * 0.3},${ball.y - radius * 0.2} L ${ball.x + radius * 0.3},${ball.y - radius * 0.2}`}
        stroke="#000000"
        strokeWidth="1"
      />
      <Path
        d={`M ${ball.x - radius * 0.5},${ball.y + radius * 0.4} L ${ball.x + radius * 0.5},${ball.y + radius * 0.4}`}
        stroke="#000000"
        strokeWidth="1"
      />
    </>
  );
};

export default BallIcon;

