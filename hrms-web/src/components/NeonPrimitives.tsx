import { Card, Tag, type CardProps } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

const cardThemes: Record<string, { style: CSSProperties; headerStyle: CSSProperties }> = {
  gold: {
    style: {
      background: 'linear-gradient(145deg, rgba(15, 22, 40, 0.75) 0%, rgba(11, 15, 26, 0.55) 100%)',
      borderColor: 'rgba(245, 196, 0, 0.18)',
      borderRadius: 14,
    },
    headerStyle: { borderBottomColor: 'rgba(245, 196, 0, 0.1)' },
  },
  cyan: {
    style: {
      background: 'linear-gradient(145deg, rgba(15, 22, 40, 0.75) 0%, rgba(11, 15, 26, 0.55) 100%)',
      borderColor: 'rgba(62, 231, 255, 0.18)',
      borderRadius: 14,
    },
    headerStyle: { borderBottomColor: 'rgba(62, 231, 255, 0.1)' },
  },
  lime: {
    style: {
      background: 'linear-gradient(145deg, rgba(15, 22, 40, 0.75) 0%, rgba(11, 15, 26, 0.55) 100%)',
      borderColor: 'rgba(124, 255, 107, 0.18)',
      borderRadius: 14,
    },
    headerStyle: { borderBottomColor: 'rgba(124, 255, 107, 0.1)' },
  },
  amber: {
    style: {
      background: 'linear-gradient(145deg, rgba(15, 22, 40, 0.75) 0%, rgba(11, 15, 26, 0.55) 100%)',
      borderColor: 'rgba(255, 181, 71, 0.18)',
      borderRadius: 14,
    },
    headerStyle: { borderBottomColor: 'rgba(255, 181, 71, 0.1)' },
  },
  pink: {
    style: {
      background: 'linear-gradient(145deg, rgba(15, 22, 40, 0.75) 0%, rgba(11, 15, 26, 0.55) 100%)',
      borderColor: 'rgba(255, 77, 216, 0.18)',
      borderRadius: 14,
    },
    headerStyle: { borderBottomColor: 'rgba(255, 77, 216, 0.1)' },
  },
  neutral: {
    style: {
      background: 'linear-gradient(145deg, rgba(15, 22, 40, 0.75) 0%, rgba(11, 15, 26, 0.55) 100%)',
      borderColor: 'rgba(145, 149, 163, 0.18)',
      borderRadius: 14,
    },
    headerStyle: { borderBottomColor: 'rgba(145, 149, 163, 0.1)' },
  },
};

export type GlassCardProps = CardProps & { gradient?: 'gold' | 'cyan' | 'lime' | 'amber' | 'pink' | 'neutral' };

export function GlassCard({ gradient = 'gold', headStyle, style, styles, ...rest }: GlassCardProps) {
  const theme = cardThemes[gradient] || cardThemes.gold;
  const mergedStyles = {
    ...(styles as any),
    header: { ...theme.headerStyle, ...(styles as any)?.header, ...headStyle },
  } as any;
  return (
    <Card
      {...rest}
      style={{ ...theme.style, ...style }}
      styles={mergedStyles}
    />
  );
}

type TagVariant = 'gold' | 'cyan' | 'lime' | 'amber' | 'pink' | 'neutral';

const tagThemes: Record<TagVariant, CSSProperties> = {
  gold: {
    background: 'rgba(245, 196, 0, 0.12)',
    color: '#f5c400',
    borderColor: 'rgba(245, 196, 0, 0.3)',
  },
  cyan: {
    background: 'rgba(62, 231, 255, 0.12)',
    color: '#3ee7ff',
    borderColor: 'rgba(62, 231, 255, 0.3)',
  },
  lime: {
    background: 'rgba(124, 255, 107, 0.12)',
    color: '#7cff6b',
    borderColor: 'rgba(124, 255, 107, 0.3)',
  },
  amber: {
    background: 'rgba(255, 181, 71, 0.12)',
    color: '#ffb547',
    borderColor: 'rgba(255, 181, 71, 0.3)',
  },
  pink: {
    background: 'rgba(255, 79, 216, 0.12)',
    color: '#ff6b9d',
    borderColor: 'rgba(255, 79, 216, 0.3)',
  },
  neutral: {
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#f7f8fb',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
};

export interface TagPillProps {
  variant?: TagVariant;
  style?: CSSProperties;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TagPill({ variant = 'neutral', style, children, className, onClick }: TagPillProps) {
  const theme = tagThemes[variant];
  return (
    <Tag 
      color="default"
      className={className}
      onClick={onClick}
      style={{ borderRadius: 9999, padding: '2px 10px', ...theme, ...style }}
    >
      {children}
    </Tag>
  );
}
