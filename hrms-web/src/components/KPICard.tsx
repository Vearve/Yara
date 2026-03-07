import { type ReactNode } from 'react';
import { GlassCard } from './NeonPrimitives';
import { Skeleton } from 'antd';

export interface KPICardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: ReactNode;
  color?: string;
  gradient?: 'gold' | 'cyan' | 'lime' | 'amber' | 'pink' | 'neutral';
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  suffix = '',
  prefix,
  color = '#f5c400',
  gradient = 'gold',
  delta,
  deltaLabel = 'vs last period',
  icon,
  loading = false,
}: KPICardProps) {
  // Only show delta if it's defined and value is not zero
  const showDelta = delta !== undefined && delta !== 0 && value !== 0;
  const deltaColor = showDelta ? (delta >= 0 ? '#7cff6b' : '#ff6b9d') : undefined;
  const deltaText = showDelta ? `${delta >= 0 ? '+' : ''}${delta}%` : null;

  return (
    <GlassCard 
      gradient={gradient}
      style={{ height: '100%' }}
      styles={{ body: { padding: '20px' } }}
    >
      {loading ? (
        <Skeleton active paragraph={false} />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span 
              style={{ 
                color: '#c4c8d4', 
                fontSize: '12px', 
                fontWeight: 500, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}
            >
              {title}
            </span>
            {icon && <span style={{ color, fontSize: '18px' }}>{icon}</span>}
          </div>
          <div className="flex items-baseline gap-2">
            {prefix && <span style={{ color, fontSize: '24px' }}>{prefix}</span>}
            <span style={{ color, fontSize: '32px', fontWeight: 700, fontFamily: 'monospace' }}>
              {value}{suffix}
            </span>
          </div>
          {deltaText && (
            <div className="inline-flex items-center gap-2 text-sm">
              <span 
                style={{ 
                  background: `${deltaColor}20`, 
                  border: `1px solid ${deltaColor}40`, 
                  borderRadius: 9999, 
                  padding: '2px 10px', 
                  fontWeight: 600,
                  color: deltaColor,
                  fontSize: '11px',
                }}
              >
                {deltaText}
              </span>
              <span style={{ color: '#c4c8d4', fontSize: '11px' }}>{deltaLabel}</span>
            </div>
          )}
          <div 
            className="h-1 rounded-full mt-1 bg-gradient-to-r" 
            style={{
              backgroundImage: `linear-gradient(90deg, ${color}, transparent)`,
              opacity: 0.6,
            }} 
          />
        </div>
      )}
    </GlassCard>
  );
}
