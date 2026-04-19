import type { Edge } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import type { Goat } from '../types';
import type { GoatFlowNode } from './GoatTreeNode';

export type GoatNodeData = {
  goat: Goat;
  onSelect: (id: string) => void;
};

const NODE_W = 160;
const NODE_H = 80;

export function buildGraphData(
  goats: Goat[],
  onSelect: (id: string) => void,
): { nodes: GoatFlowNode[]; edges: Edge[] } {
  const idSet = new Set(goats.map(g => g.id));

  const nodes: GoatFlowNode[] = goats.map(goat => ({
    id: goat.id,
    type: 'goatNode' as const,
    position: { x: 0, y: 0 },
    data: { goat, onSelect },
  }));

  const edges: Edge[] = [];
  for (const goat of goats) {
    if (goat.fatherId && idSet.has(goat.fatherId)) {
      edges.push({
        id: `father-${goat.id}`,
        source: goat.fatherId,
        target: goat.id,
        type: 'smoothstep',
        style: { stroke: '#16a34a', strokeWidth: 2 },
      });
    }
    if (goat.motherId && idSet.has(goat.motherId)) {
      edges.push({
        id: `mother-${goat.id}`,
        source: goat.motherId,
        target: goat.id,
        type: 'smoothstep',
        style: { stroke: '#ea580c', strokeWidth: 2 },
      });
    }
  }

  return { nodes, edges };
}

export function runDagreLayout(
  nodes: GoatFlowNode[],
  edges: Edge[],
): { nodes: GoatFlowNode[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 50, marginx: 40, marginy: 40 });

  for (const node of nodes) g.setNode(node.id, { width: NODE_W, height: NODE_H });
  for (const edge of edges) g.setEdge(edge.source, edge.target);

  dagre.layout(g);

  const layoutedNodes = nodes.map(node => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } };
  });

  return { nodes: layoutedNodes, edges };
}
