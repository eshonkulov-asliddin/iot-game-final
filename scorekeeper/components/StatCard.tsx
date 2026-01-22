import React, { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, highlight = false, icon }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl border transition-colors duration-300 ${highlight ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${highlight ? 'text-indigo-600' : 'text-slate-500'}`}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 
              className={`text-3xl font-bold tracking-tight transition-transform duration-300 ${
                animate ? 'scale-110 text-indigo-700' : highlight ? 'text-indigo-900' : 'text-slate-900'
              }`}
            >
              {value.toLocaleString()}
            </h3>
          </div>
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};