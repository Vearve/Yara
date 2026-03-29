import type { ReactNode } from 'react';
import { GlassCard, TagPill } from './NeonPrimitives';

export type HeroBannerTag = {
  label: string;
  variant?: 'gold' | 'cyan' | 'lime' | 'amber' | 'pink' | 'neutral';
};

export interface HeroBannerProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  tags?: HeroBannerTag[];
  actions?: ReactNode;
  gradient?: 'gold' | 'cyan' | 'lime' | 'amber' | 'pink' | 'neutral';
}

export function HeroBanner({
  eyebrow,
  title,
  description,
  icon,
  tags = [],
  actions,
  gradient = 'gold',
}: HeroBannerProps) {
  return (
    <GlassCard gradient={gradient} className="app-hero-banner" style={{ padding: 24 }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="app-hero-eyebrow inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold">
            {eyebrow}
          </div>
          <div className="app-hero-title flex items-center gap-3" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.08 }}>
            {icon}
            <span className="truncate">{title}</span>
          </div>
          <div className="app-hero-description text-sm" style={{ maxWidth: 780 }}>
            {description}
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag, idx) => (
                <TagPill key={`${tag.label}-${idx}`} variant={tag.variant ?? 'neutral'}>
                  {tag.label}
                </TagPill>
              ))}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap gap-3 md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
