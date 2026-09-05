import React from 'react';
import { RoleType, ProjectStatus, AvailabilityStatus } from '../../types/client.types.js';

interface BadgeProps {
  role?: RoleType | string;
  status?: ProjectStatus | string;
  availability?: AvailabilityStatus | string;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  role,
  status,
  availability,
  children,
  className = ''
}) => {
  if (role) {
    const formatted = role.replace(/_/g, ' ');
    return (
      <span className={`badge badge-role-${role} ${className}`}>
        {children || formatted}
      </span>
    );
  }

  if (status) {
    const formatted = status.replace(/_/g, ' ');
    return (
      <span className={`badge badge-status-${status} ${className}`}>
        {children || formatted}
      </span>
    );
  }

  if (availability) {
    return (
      <span className={`badge ${className}`} style={{ background: 'rgba(255,255,255,0.06)' }}>
        <span className={`status-dot dot-${availability}`} />
        {children || availability}
      </span>
    );
  }

  return <span className={`badge ${className}`}>{children}</span>;
};
