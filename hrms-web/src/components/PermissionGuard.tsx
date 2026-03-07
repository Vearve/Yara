/**
 * Permission-based UI wrapper component
 * Shows content only if user has required permission
 */

import { Typography, Empty } from 'antd';
import React from 'react';
import { canPerformAction } from '../lib/permissions';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function PermissionGuard({ permission, children, fallback, style }: PermissionGuardProps) {
  const hasAccess = canPerformAction(permission);

  if (!hasAccess) {
    return (
      fallback || (
        <div style={{ padding: '20px', textAlign: 'center', ...style }}>
          <Empty
            description={`Permission Denied: ${permission}`}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ opacity: 0.6 }}
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            You do not have permission to access this feature
          </Typography.Text>
        </div>
      )
    );
  }

  return <>{children}</>;
}
