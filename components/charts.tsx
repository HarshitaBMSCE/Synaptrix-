"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TrendPoint = { date: string; net: number; underpayment: number; active: number; waiting: number };
type PlatformPoint = { platform: string; netEarnings: number; fairnessAverage: number };

// Premium accessible color palette matching GigShield's theme
const colors = ["#F4511E", "#475569", "#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b"];

export function EarningsTrend({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F4511E" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#F4511E" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E7EA" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E7E7EA", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
          <Area type="monotone" dataKey="net" name="Net payout" stroke="#F4511E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
          <Area type="monotone" dataKey="underpayment" name="Payment gap" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorGap)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlatformSplit({ data }: { data: PlatformPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="netEarnings" nameKey="platform" innerRadius={55} outerRadius={80} paddingAngle={3}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E7E7EA", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: 600, color: "#202124" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HoursChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E7EA" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E7E7EA", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: 600, color: "#202124" }} />
          <Bar dataKey="active" name="Active hours" fill="#F4511E" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="waiting" name="Waiting hours" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
