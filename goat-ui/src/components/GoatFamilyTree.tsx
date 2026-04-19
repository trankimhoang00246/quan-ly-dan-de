import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Controls, MiniMap, Background, type NodeTypes } from '@xyflow/react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { api } from '../api';
import type { Goat } from '../types';
import GoatTreeNode, { type GoatFlowNode } from './GoatTreeNode';
import { buildGraphData, runDagreLayout, type GoatNodeData } from './goatTreeUtils';
import GoatDetailModal from '../pages/GoatDetailPage';

const nodeTypes: NodeTypes = { goatNode: GoatTreeNode };

export default function GoatFamilyTree() {
  const [goats, setGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    api.getGoats()
      .then(setGoats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!goats.length) return { nodes: [] as GoatFlowNode[], edges: [] };
    const { nodes: raw, edges: rawEdges } = buildGraphData(goats, setSelectedId);
    return runDagreLayout(raw, rawEdges);
  }, [goats]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress color="primary" /></Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 220px)', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
      <ReactFlow<GoatFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.15}
        maxZoom={2.5}
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const d = node.data as GoatNodeData;
            return d.goat.gender === 'MALE' ? '#16a34a' : '#ea580c';
          }}
          style={{ background: '#f9fafb' }}
        />
        <Background color="#e5e7eb" gap={20} />
      </ReactFlow>
      {selectedId && (
        <GoatDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </Box>
  );
}
