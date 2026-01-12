"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendChartProps {
  data: Array<{ date: string; rank: number }>;
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis reversed hide />
          <Tooltip
            contentStyle={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: 12,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="rank"
            stroke="#1f2937"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
