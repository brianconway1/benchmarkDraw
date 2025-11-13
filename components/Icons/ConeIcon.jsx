import React from 'react';
import { Polygon } from 'react-native-svg';

const ConeIcon = ({ cone, selected = false }) => {
  // Validate cone data
  if (!cone || typeof cone.x !== 'number' || typeof cone.y !== 'number') {
    console.error('Invalid cone data:', cone);
    return null;
  }
  
  // Validate coordinates
  if (!isFinite(cone.x) || !isFinite(cone.y)) {
    console.error('Invalid cone coordinates:', cone);
    return null;
  }
  
  const getSize = () => {
    switch (cone.size) {
      case 'small':
        return 15;
      case 'medium':
        return 20;
      case 'large':
        return 25;
      default:
        return 20;
    }
  };

  const size = getSize();
  const points = `${cone.x},${cone.y - size} ${cone.x + size},${cone.y + size} ${cone.x - size},${cone.y + size}`;

  return (
    <Polygon
      points={points}
      fill={cone.color}
      stroke={selected ? '#FF0000' : '#000000'}
      strokeWidth={selected ? 3 : 2}
    />
  );
};

export default ConeIcon;
