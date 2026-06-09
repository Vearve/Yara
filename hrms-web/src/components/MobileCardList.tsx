/**
 * MobileCardList — renders a Table on desktop, swipeable cards on mobile.
 * Swipe a card left to reveal Edit / Delete actions.
 */
import React, { useRef, useState } from 'react';
import { Grid, Avatar, Tag, Spin, Empty, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { UserOutlined } from '@ant-design/icons';

export interface MobileCardField {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
  span?: number; // 1 or 2 (default 1 out of 2-col grid)
}

export interface MobileCardListProps<T = any> {
  dataSource: T[];
  rowKey: string | ((row: T) => string);
  loading?: boolean;
  primaryField: string;
  secondaryField?: string;
  avatarField?: string;
  statusField?: string;
  statusRender?: (value: any, record: T) => React.ReactNode;
  fields: MobileCardField[];
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  deleteConfirm?: string;
  /** Rendered on desktop — pass your <Table> here */
  desktopTable: React.ReactNode;
}

const ACTION_WIDTH = 110;
const SWIPE_THRESHOLD = 55;

function SwipeableCard({
  children,
  onEdit,
  onDelete,
  deleteConfirm,
}: {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirm?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [snapped, setSnapped] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const dirLocked = useRef<'h' | 'v' | null>(null);

  const hasActions = onEdit || onDelete;
  if (!hasActions) return <>{children}</>;

  const snapOpen = () => { setOffset(-ACTION_WIDTH); setSnapped(true); };
  const snapClose = () => { setOffset(0); setSnapped(false); };

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    dragging.current = true;
    dirLocked.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!dirLocked.current) {
      dirLocked.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }
    if (dirLocked.current === 'v') return;

    e.preventDefault();
    const base = snapped ? -ACTION_WIDTH : 0;
    const raw = base + dx;
    setOffset(Math.max(-ACTION_WIDTH, Math.min(0, raw)));
  };

  const onTouchEnd = () => {
    dragging.current = false;
    if (dirLocked.current !== 'h') return;
    if (offset < -SWIPE_THRESHOLD) {
      snapOpen();
    } else {
      snapClose();
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, marginBottom: 10 }}>
      {/* Revealed action strip */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: ACTION_WIDTH,
          display: 'flex',
          alignItems: 'stretch',
          zIndex: 0,
        }}
      >
        {onEdit && (
          <button
            onClick={() => { snapClose(); onEdit(); }}
            style={{
              flex: 1,
              border: 'none',
              background: '#4a3fcf',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EditOutlined />
          </button>
        )}
        {onDelete && (
          <Popconfirm
            title={deleteConfirm || 'Delete this record?'}
            onConfirm={() => { snapClose(); onDelete(); }}
            placement="left"
          >
            <button
              style={{
                flex: 1,
                border: 'none',
                background: '#ff4d4f',
                color: '#fff',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DeleteOutlined />
            </button>
          </Popconfirm>
        )}
      </div>

      {/* Swipeable card content */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? 'none' : 'transform 0.22s cubic-bezier(.4,0,.2,1)',
          position: 'relative',
          zIndex: 1,
          touchAction: 'pan-y',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={snapped ? snapClose : undefined}
      >
        {children}
      </div>
    </div>
  );
}

export default function MobileCardList<T extends Record<string, any>>({
  dataSource,
  rowKey,
  loading,
  primaryField,
  secondaryField,
  avatarField,
  statusField,
  statusRender,
  fields,
  onView,
  onEdit,
  onDelete,
  deleteConfirm,
  desktopTable,
}: MobileCardListProps<T>) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const getKey = (record: T): string => {
    if (typeof rowKey === 'function') return rowKey(record);
    return String(record[rowKey]);
  };

  if (!isMobile) return <>{desktopTable}</>;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dataSource.length) {
    return <Empty description="No records" style={{ padding: 40 }} />;
  }

  return (
    <div style={{ padding: '0 2px' }}>
      {dataSource.map((record) => {
        const key = getKey(record);
        const primaryVal = record[primaryField];
        const secondaryVal = secondaryField ? record[secondaryField] : null;
        const avatarSrc = avatarField ? record[avatarField] : null;
        const statusVal = statusField ? record[statusField] : null;

        return (
          <SwipeableCard
            key={key}
            onEdit={onEdit ? () => onEdit(record) : undefined}
            onDelete={onDelete ? () => onDelete(record) : undefined}
            deleteConfirm={deleteConfirm}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar
                  src={avatarSrc || undefined}
                  icon={<UserOutlined />}
                  size={44}
                  style={{ flexShrink: 0, border: '2px solid var(--border)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {primaryVal || '—'}
                  </div>
                  {secondaryVal && (
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 1 }}>
                      {secondaryVal}
                    </div>
                  )}
                </div>
                {statusVal && (
                  <div style={{ flexShrink: 0 }}>
                    {statusRender
                      ? statusRender(statusVal, record)
                      : <Tag style={{ margin: 0 }}>{statusVal}</Tag>}
                  </div>
                )}
              </div>

              {/* Fields grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px 12px',
                marginBottom: 12,
              }}>
                {fields.map((f) => (
                  <div
                    key={f.key}
                    style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}
                  >
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                      {f.render ? f.render(record[f.key], record) : (record[f.key] || '—')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {onView && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onView(record)}
                    style={{ flex: 1, height: 34 }}
                  >
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record)}
                    style={{ height: 34 }}
                  />
                )}
                {onDelete && (
                  <Popconfirm title={deleteConfirm || 'Delete?'} onConfirm={() => onDelete(record)}>
                    <Button danger size="small" icon={<DeleteOutlined />} style={{ height: 34 }} />
                  </Popconfirm>
                )}
              </div>

              {/* Swipe hint — only show on first card */}
            </div>
          </SwipeableCard>
        );
      })}

      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, paddingBottom: 8, paddingTop: 4 }}>
        ← swipe card left for quick edit / delete
      </div>
    </div>
  );
}
