import type { GoatLog } from '../types';
import { Box, Typography } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface Props {
  logs: GoatLog[];
}

export default function WeightChart({ logs }: Props) {
  const data = logs
    .filter(l => (l.action === 'CREATE' || l.action === 'UPDATE_WEIGHT') && l.weight != null)
    .slice()
    .sort((a, b) => {
      const da = a.date ?? a.createdAt;
      const db = b.date ?? b.createdAt;
      return da < db ? -1 : 1;
    })
    .map(l => ({
      label: new Date(l.date ?? l.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      weight: l.weight as number,
    }));

  if (data.length < 2) {
    return (
      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
        Cần ít nhất 2 lần cân để hiện biểu đồ
      </Box>
    );
  }

  const weights = data.map(d => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const avg = weights.reduce((s, w) => s + w, 0) / weights.length;
  const trend = data[data.length - 1].weight - data[0].weight;

  return (
    <Box>
      {/* Trend summary */}
      <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
        {[
          { label: 'Thấp nhất', value: `${min} kg`, color: '#dc2626' },
          { label: 'Cao nhất',  value: `${max} kg`, color: '#16a34a' },
          { label: 'Trung bình', value: `${avg.toFixed(1)} kg`, color: '#6366f1' },
          { label: 'Tăng/giảm', value: `${trend >= 0 ? '+' : ''}${trend.toFixed(1)} kg`, color: trend >= 0 ? '#16a34a' : '#dc2626' },
        ].map(item => (
          <Box key={item.label}>
            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>{item.value}</Typography>
          </Box>
        ))}
      </Box>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            domain={[Math.max(0, min - 2), max + 2]}
            tick={{ fontSize: 11 }}
            tickFormatter={v => `${v}kg`}
          />
          <Tooltip
            formatter={(v) => [`${v} kg`, 'Cân nặng']}
            labelStyle={{ fontSize: 12 }}
          />
          <ReferenceLine y={avg} stroke="#6366f1" strokeDasharray="4 2" />
          <Line
            type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2.5}
            dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
