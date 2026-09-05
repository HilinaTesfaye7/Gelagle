import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  height = 8
}) => {
  const safeProgress = Math.max(0, Math.min(100, progress || 0));

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>Delivery Progress</span>
          <span style={{ fontWeight: 600, color: '#fff' }}>{safeProgress}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div className="progress-fill" style={{ width: `${safeProgress}%` }} />
      </div>
    </div>
  );
};
