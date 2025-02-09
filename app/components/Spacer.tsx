import React from 'react';

interface SpacerProps {
  height?: string;
}

const Spacer: React.FC<SpacerProps> = ({ height = 'var(--p-space-500)' }) => {
  return (
    <div
      style={{
        height: height.startsWith('--') ? `var(${height})` : height,
      }}
    />
  );
};

export default Spacer;