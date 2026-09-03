import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error loading dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat: any, idx: number) => (
          <div key={idx} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="mt-2 flex items-end justify-between overflow-hidden">
              <span className="text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap truncate" title={stat.value}>
                {stat.value}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
               <span className={`font-medium ${stat.trend.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                {stat.trend}
              </span>
              <span className="text-slate-400">Last 7 days</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Income vs Expenses</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.incomeVsExpenses} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(value: number) => [`RWF ${value.toLocaleString()}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit vs Investment Chart */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Profit vs Investment</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.profitVsInvestment} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`RWF ${value.toLocaleString()}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="investment" name="Investment" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sales Table Summary */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-slate-900">Recent Sales</h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Receipt No</th>
                <th className="px-6 py-3 font-medium">Cashier</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-center">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.recentSales.map((sale: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{sale.receipt}</td>
                  <td className="px-6 py-4">{sale.cashier}</td>
                  <td className="px-6 py-4 text-slate-500">{sale.date}</td>
                  <td className="px-6 py-4 font-medium text-right">{sale.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {sale.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
