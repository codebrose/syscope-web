import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900/80 backdrop-blur-md rounded-xl shadow-md hover:scale-105 transform transition">
      <div className={`p-3 rounded-lg text-white ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-zinc-400 text-sm">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;