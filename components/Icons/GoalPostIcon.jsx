import React from 'react';
import { Line, Rect } from 'react-native-svg';

const GoalPostIcon = ({ goalPost, selected = false }) => {
  // Validate goalPost data
  if (!goalPost || typeof goalPost.x !== 'number' || typeof goalPost.y !== 'number') {
    console.error('Invalid goalPost data:', goalPost);
    return null;
  }
  
  // Validate coordinates
  if (!isFinite(goalPost.x) || !isFinite(goalPost.y)) {
    console.error('Invalid goalPost coordinates:', goalPost);
    return null;
  }
  
  const width = goalPost.width || 30;
  const height = goalPost.height || 40;
  const postWidth = 3;
  const crossbarHeight = 20;

  const x = goalPost.x - width / 2;
  const y = goalPost.y - height / 2;

  return (
    <>
      {/* Left post */}
      <Rect
        x={x}
        y={y}
        width={postWidth}
        height={height}
        fill="#FFFFFF"
        stroke={selected ? '#FF0000' : '#000000'}
        strokeWidth={selected ? 3 : 2}
      />
      {/* Right post */}
      <Rect
        x={x + width - postWidth}
        y={y}
        width={postWidth}
        height={height}
        fill="#FFFFFF"
        stroke={selected ? '#FF0000' : '#000000'}
        strokeWidth={selected ? 3 : 2}
      />
      {/* Crossbar */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={postWidth}
        fill="#FFFFFF"
        stroke={selected ? '#FF0000' : '#000000'}
        strokeWidth={selected ? 3 : 2}
      />
      {/* Net lines (optional decorative lines) */}
      <Line
        x1={x + width / 4}
        y1={y + postWidth}
        x2={x + width / 4}
        y2={y + height}
        stroke="#CCCCCC"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
      <Line
        x1={x + width / 2}
        y1={y + postWidth}
        x2={x + width / 2}
        y2={y + height}
        stroke="#CCCCCC"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
      <Line
        x1={x + (3 * width) / 4}
        y1={y + postWidth}
        x2={x + (3 * width) / 4}
        y2={y + height}
        stroke="#CCCCCC"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    </>
  );
};

export default GoalPostIcon;
