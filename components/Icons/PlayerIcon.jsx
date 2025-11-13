import React from 'react';
import { Circle, Text as SvgText, Defs, Pattern, Rect } from 'react-native-svg';

const PlayerIcon = ({ player, size = 30, selected = false }) => {
  // Validate player data
  if (!player || typeof player.x !== 'number' || typeof player.y !== 'number') {
    console.error('Invalid player data:', player);
    return null;
  }
  
  // Validate coordinates
  if (!isFinite(player.x) || !isFinite(player.y)) {
    console.error('Invalid player coordinates:', player);
    return null;
  }
  
  const radius = size / 2;

  const renderPlayer = () => {
    if (player.style === 'striped') {
      const patternId = `stripes-${player.color}-${player.stripeColor}`;
      return (
        <>
          <Defs>
            <Pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
              <Rect width="4" height="4" fill={player.color} />
              <Rect width="2" height="4" fill={player.stripeColor} />
            </Pattern>
          </Defs>
          <Circle
            cx={player.x}
            cy={player.y}
            r={radius - 1}
            fill={`url(#${patternId})`}
            stroke={selected ? '#FF0000' : '#000000'}
            strokeWidth={selected ? 3 : 1}
          />
        </>
      );
    } else {
      return (
        <Circle
          cx={player.x}
          cy={player.y}
          r={radius - 1}
          fill={player.color}
          stroke={selected ? '#FF0000' : '#000000'}
          strokeWidth={selected ? 3 : 1}
        />
      );
    }
  };

  const renderLabel = () => {
    if (player.labelType === 'none' || !player.label) {
      return null;
    }

    return (
      <SvgText
        x={player.x}
        y={player.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.6}
        fill="#000000"
        fontWeight="bold"
        fontFamily="Arial"
      >
        {player.label}
      </SvgText>
    );
  };

  return (
    <>
      {renderPlayer()}
      {renderLabel()}
    </>
  );
};

export default PlayerIcon;
