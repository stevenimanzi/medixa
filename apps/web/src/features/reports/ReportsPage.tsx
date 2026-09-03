import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../lib/api';

export default function ReportsPage() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['reports-dashboard'],
    queryFn: async () => {
      const res = await api.get('/reports/dashboard');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { totals, chartData, recentSales } = report;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Business Reports</h1>
        <button className="bg-white border border-slate-200 text-slate-700 font-medium py-2.5 px-5 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
          Export as PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Income</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">RWF {totals.income.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">RWF {totals.expenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Net Profit</p>
              <p className={`text-3xl font-bold mt-2 ${totals.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                RWF {totals.profit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Income vs Expenses (Last 7 Days)
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `RWF ${val}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`RWF ${value.toLocaleString()}`]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity (Sales) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Sales</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recentSales?.length > 0 ? (
              recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{sale.receipt_no}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(sale.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-blue-600">RWF {parseFloat(sale.total_amount).toLocaleString()}</div>
                    <div className="text-xs text-slate-400 mt-1">by {sale.user?.name || 'System'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No recent sales found.
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            View All Sales
          </button>
        </div>

      </div>
    </div>
  );
}
