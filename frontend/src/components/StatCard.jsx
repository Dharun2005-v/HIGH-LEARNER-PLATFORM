import React from 'react';

export default function StatCard({ title, value, description }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-md">
      <h3 className="text-sm text-slate-400 mb-1">{title}</h3>
      <p className="text-xl font-bold text-white">{value}</p>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
}
