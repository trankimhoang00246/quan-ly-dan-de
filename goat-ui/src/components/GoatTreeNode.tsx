import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { GoatNodeData } from './goatTreeUtils';
import { STATUS_LABEL, STATUS_COLOR, TAG_LABEL, TAG_COLOR } from '../types';

export type GoatFlowNode = Node<GoatNodeData, 'goatNode'>;

const HANDLE_STYLE: React.CSSProperties = { opacity: 0, pointerEvents: 'none' };

const ALIVE_BORDER = { MALE: '#16a34a', FEMALE: '#ea580c' } as const;
const BG = { MALE: '#dcfce7', FEMALE: '#fef3c7' } as const;

export default function GoatTreeNode({ data }: NodeProps<GoatFlowNode>) {
  const { goat, onSelect } = data;
  const alive = goat.status === 'ALIVE';
  const border = alive ? ALIVE_BORDER[goat.gender] : '#9ca3af';
  const hasTag = !!goat.tag;

  return (
    <>
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
      <div
        onClick={() => onSelect(goat.id)}
        style={{
          width: 160,
          height: hasTag ? 96 : 80,
          background: alive ? BG[goat.gender] : '#f3f4f6',
          border: `2px solid ${border}`,
          borderRadius: 10,
          cursor: 'pointer',
          opacity: alive ? 1 : 0.65,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          userSelect: 'none',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: border, fontSize: 16 }}>{goat.gender === 'MALE' ? '♂' : '♀'}</span>
          {goat.code}
        </div>
        <div style={{
          background: STATUS_COLOR[goat.status],
          color: '#fff',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          padding: '1px 8px',
        }}>
          {STATUS_LABEL[goat.status]}
        </div>
        {hasTag && (
          <div style={{
            background: TAG_COLOR[goat.tag!],
            color: '#fff',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 600,
            padding: '1px 7px',
          }}>
            {TAG_LABEL[goat.tag!]}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </>
  );
}
