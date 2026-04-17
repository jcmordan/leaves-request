"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, TrendingUp, Users, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface TeamStatsGridProps {
  pendingCount: number;
  activeLeaves: number;
  trendPercentage: number;
  availablePercentage: number;
}

export function TeamStatsGrid({
  pendingCount,
  activeLeaves,
  trendPercentage,
  availablePercentage,
}: TeamStatsGridProps) {
  const t = useTranslations("team");

  const pieData = [
    { name: "Available", value: availablePercentage },
    { name: "Unavailable", value: 100 - availablePercentage },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Action Required */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between h-32 group">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {t("actionRequired")}
          </p>
          <AlertCircle className="h-4 w-4 text-error" />
        </div>
        <div>
          <p className="text-3xl font-black text-primary">
            {pendingCount.toString().padStart(2, "0")}
          </p>
          <p className="text-[10px] text-error font-bold uppercase tracking-wider">
            {t("activeLeavesThisWeek")}
          </p>
        </div>
      </div>

      {/* Activity Tracking */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {t("activityTracking")}
          </p>
          <TrendingUp className="h-4 w-4 text-secondary" />
        </div>
        <div>
          <p className="text-3xl font-black text-primary">
            {activeLeaves.toString().padStart(2, "0")}
          </p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {t("activeLeavesThisWeek")}
          </p>
        </div>
      </div>

      {/* Leave Trends */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {t("leaveTrends")}
          </p>
          <TrendingUp className="h-4 w-4 text-primary-container" />
        </div>
        <div>
          <p className="text-3xl font-black text-primary">
            {trendPercentage > 0 ? `+${trendPercentage}` : trendPercentage}%
          </p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {t("vsPreviousMonth")}
          </p>
        </div>
      </div>

      {/* Team Capacity */}
      <div className="bg-primary text-white p-5 rounded-xl shadow-lg flex flex-col justify-between h-32 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
            {t("teamCapacity")}
          </p>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-3xl font-black">{availablePercentage}%</p>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
              {t("availablePersonnel")}
            </p>
          </div>
          <div className="w-12 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={15}
                  outerRadius={22}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="var(--color-secondary)" stroke="none" />
                  <Cell fill="rgba(255,255,255,0.1)" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Geometric Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-full -mr-16 -mt-16" />
      </div>
    </div>
  );
}
