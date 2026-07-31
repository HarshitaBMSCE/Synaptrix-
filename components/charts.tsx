"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TrendPoint = { date: string; net: number; underpayment: number; active: number; waiting: number };
type PlatformPoint = { platform: string; netEarnings: number; fairnessAverage: number };

const colors = ["#14745b", "#f0a91b", "#dc2626", "#2563eb", "#7c3aed", "#0891b2"];

export function EarningsTrend({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7dce2" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="net" name="Net payout" stroke="#14745b" fill="#9fe2cf" />
          <Area type="monotone" dataKey="underpayment" name="Payment gap" stroke="#dc2626" fill="#fecaca" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlatformSplit({ data }: { data: PlatformPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="netEarnings" nameKey="platform" innerRadius={48} outerRadius={82} paddingAngle={2}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HoursChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7dce2" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="active" name="Active hours" fill="#14745b" />
          <Bar dataKey="waiting" name="Waiting hours" fill="#f0a91b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
