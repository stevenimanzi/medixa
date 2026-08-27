import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Manage inventory, pricing and availability across your store</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: '1,248', trend: '+4.2%' },
          { label: 'Total Revenue', value: 'RWF 8,432,000', trend: '+12.5%' },
          { label: 'Total Orders', value: '142', trend: '-1.4%' },
          { label: 'Customers', value: '3,240', trend: '+2.1%' },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center justify-between">
              {stat.label}
              <span className="text-slate-400 text-lg leading-none">⋮</span>
            </h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
               <span className={`font-medium ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend}
              </span>
              <span className="text-slate-400">Last 7 days</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Placeholder for future charts or tables */}
      <div className="h-96 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 bg-white">
        Data Table / Charts Placeholder
      </div>
    </div>
  );
}
