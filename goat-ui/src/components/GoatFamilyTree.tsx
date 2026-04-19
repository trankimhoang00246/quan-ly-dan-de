import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Controls, MiniMap, Background, type NodeTypes } from '@xyflow/react';
import { Box, CircularProgress, Alert, TextField, InputAdornment, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getGoats()
      .then(setGoats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // When search is active, filter to matched goat + ancestors/descendants
  const filteredGoats = useMemo(() => {
    if (!search.trim()) return goats;
    const q = search.trim().toLowerCase();
    const matched = new Set<string>();

    const addAncestors = (id: string) => {
      const g = goats.find(x => x.id === id);
      if (!g || matched.has(id)) return;
      matched.add(id);
      if (g.fatherId) addAncestors(g.fatherId);
      if (g.motherId) addAncestors(g.motherId);
    };

    const addDescendants = (id: string) => {
      if (matched.has(id)) return;
      matched.add(id);
      goats.filter(x => x.fatherId === id || x.motherId === id).forEach(c => addDescendants(c.id));
    };

    goats.filter(g => g.code.toLowerCase().includes(q)).forEach(g => {
      addAncestors(g.id);
      addDescendants(g.id);
    });

    return goats.filter(g => matched.has(g.id));
  }, [goats, search]);

  const { nodes, edges } = useMemo(() => {
    if (!filteredGoats.length) return { nodes: [] as GoatFlowNode[], edges: [] };
    const { nodes: raw, edges: rawEdges } = buildGraphData(filteredGoats, setSelectedId);
    return runDagreLayout(raw, rawEdges);
  }, [filteredGoats]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress color="primary" /></Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Tìm dê theo mã số..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        {search && (
          <Chip
            label={`${filteredGoats.length} / ${goats.length} con`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={() => setSearch('')}
          />
        )}
      </Box>

      <Box sx={{ width: '100%', height: 'calc(100vh - 280px)', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        {filteredGoats.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
            Không tìm thấy dê nào khớp với "{search}"
          </Box>
        ) : (
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
        )}
      </Box>

      {selectedId && (
        <GoatDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </Box>
  );
}
