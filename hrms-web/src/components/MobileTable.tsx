/**
 * MobileTable — drop-in replacement for Ant Design <Table>.
 * Accepts identical props. On desktop renders the normal Table.
 * On mobile (< 768px) renders each row as a card with swipe-to-reveal actions.
 */
import React, { useRef, useState } from 'react';
import { Table, Grid, Spin, Empty, Popconfirm } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ACTION_W = 110;
const SWIPE_T = 55;

/* ─── Swipeable wrapper ─────────────────────────────────── */
function SwipeRow({
  children,
  editBtn,
  deleteBtn,
}: {
  children: React.ReactNode;
  editBtn?: React.ReactNode;
  deleteBtn?: React.ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const [snapped, setSnapped] = useState(false);
  const sx = useRef(0);
  const sy = useRef(0);
  const dragging = useRef(false);
  const dir = useRef<'h' | 'v' | null>(null);
  const hasActions = editBtn || deleteBtn;

  const close = () => { setOffset(0); setSnapped(false); };
  const open = () => { setOffset(-ACTION_W); setSnapped(true); };

  const ts = (e: React.TouchEvent) => {
    sx.current = e.touches[0].clientX;
    sy.current = e.touches[0].clientY;
    dragging.current = true;
    dir.current = null;
  };
  const tm = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - sx.current;
    const dy = e.touches[0].clientY - sy.current;
    if (!dir.current) dir.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    if (dir.current === 'v') return;
    e.preventDefault();
    const base = snapped ? -ACTION_W : 0;
    setOffset(Math.max(-ACTION_W, Math.min(0, base + dx)));
  };
  const te = () => {
    dragging.current = false;
    if (dir.current !== 'h') return;
    offset < -SWIPE_T ? open() : close();
  };

  if (!hasActions) return <>{children}</>;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, marginBottom: 8 }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: ACTION_W, display: 'flex' }}>
        {editBtn && (
          <button onClick={() => { close(); }}
            style={{ flex: 1, border: 'none', background: '#4a3fcf', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {editBtn}
          </button>
        )}
        {deleteBtn && (
          <button onClick={() => { close(); }}
            style={{ flex: 1, border: 'none', background: '#ff4d4f', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {deleteBtn}
          </button>
        )}
      </div>
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? 'none' : 'transform 0.22s cubic-bezier(.4,0,.2,1)',
          position: 'relative',
          zIndex: 1,
          touchAction: 'pan-y',
        }}
        onTouchStart={ts}
        onTouchMove={tm}
        onTouchEnd={te}
        onClick={snapped ? close : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────── */
function isActionCol(col: ColumnType<any>): boolean {
  const k = String(col.key || '').toLowerCase();
  const t = String((col as any).title || '').toLowerCase();
  return k === 'actions' || k === 'action' || t === 'actions' || t === 'action';
}

function getValue(record: any, col: ColumnType<any>, idx: number): React.ReactNode {
  const raw = col.dataIndex ? record[col.dataIndex as string] : undefined;
  return col.render ? col.render(raw, record, idx) : (raw ?? '—');
}

function isLoading(loading: TableProps<any>['loading']): boolean {
  if (typeof loading === 'boolean') return loading;
  return (loading as any)?.spinning ?? false;
}

/* ─── Card renderer ─────────────────────────────────────── */
function RecordCard({ record, columns, idx }: { record: any; columns: ColumnType<any>[]; idx: number }) {
  const actionCol = columns.find(isActionCol);
  const dataCols = columns.filter((c) => !isActionCol(c));

  // First data column = card title
  const [titleCol, ...restCols] = dataCols;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '12px 14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Title row */}
      {titleCol && (
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 10, wordBreak: 'break-word' }}>
          {getValue(record, titleCol, idx)}
        </div>
      )}

      {/* Fields grid */}
      {restCols.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 10 }}>
          {restCols.map((col) => (
            <div key={String(col.key || col.dataIndex || Math.random())}
              style={{ gridColumn: (col as any).ellipsis ? 'span 2' : 'span 1' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>
                {String((col as any).title || '')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)' }}>
                {getValue(record, col, idx)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actionCol && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          {(actionCol as any).render?.(null, record, idx)}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */
export default function MobileTable<T extends object>(props: TableProps<T>) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  if (!isMobile) return <Table {...props} />;

  const { columns = [], dataSource = [], rowKey, loading: loadingProp } = props;
  const spinning = isLoading(loadingProp);

  if (spinning) {
    return <div style={{ textAlign: 'center', padding: 32 }}><Spin size="large" /></div>;
  }
  if (!dataSource.length) {
    return <Empty description="No records" style={{ padding: 32 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const getKey = (record: T, idx: number): string => {
    if (!rowKey) return String(idx);
    if (typeof rowKey === 'function') return String(rowKey(record, idx));
    return String((record as any)[rowKey]) || String(idx);
  };

  return (
    <div>
      {(dataSource as T[]).map((record, idx) => (
        <SwipeRow key={getKey(record, idx)}>
          <RecordCard record={record} columns={columns as ColumnType<any>[]} idx={idx} />
        </SwipeRow>
      ))}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, padding: '4px 0 8px' }}>
        {(dataSource as T[]).length} records · swipe left for actions
      </div>
    </div>
  );
}
