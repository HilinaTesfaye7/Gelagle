import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  const ActionIcon = action?.icon;

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={26} />
      </div>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.88rem' }}>
        {description}
      </p>
      {action && (
        <button className="btn btn-primary btn-sm" onClick={action.onClick}>
          {ActionIcon && <ActionIcon size={14} />}
          {action.label}
        </button>
      )}
    </div>
  );
};
