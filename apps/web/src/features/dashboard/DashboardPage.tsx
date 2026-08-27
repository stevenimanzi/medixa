import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const incomeVsExpensesData = [
  { name: 'Jan', income: 4500000, expenses: 3200000 },
  { name: 'Feb', income: 5200000, expenses: 3100000 },
  { name: 'Mar', income: 4800000, expenses: 3500000 },
  { name: 'Apr', income: 6100000, expenses: 3800000 },
  { name: 'May', income: 5900000, expenses: 3400000 },
  { name: 'Jun', income: 7200000, expenses: 4100000 },
  { name: 'Jul', income: 8432000, expenses: 4800000 },
];

const profitVsInvestmentData = [
  { name: 'Jan', profit: 1300000, investment: 5000000 },
  { name: 'Feb', profit: 2100000, investment: 5000000 },
  { name: 'Mar', profit: 1300000, investment: 5500000 },
  { name: 'Apr', profit: 2300000, investment: 5500000 },
  { name: 'May', profit: 2500000, investment: 6000000 },
  { name: 'Jun', profit: 3100000, investment: 6000000 },
  { name: 'Jul', profit: 3632000, investment: 6500000 },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'John Doe', amount: 'RWF 15,000', status: 'Completed', date: '2026-08-27' },
  { id: '#ORD-002', customer: 'Jane Smith', amount: 'RWF 42,000', status: 'Pending', date: '2026-08-27' },
  { id: '#ORD-003', customer: 'Robert Johnson', amount: 'RWF 8,500', status: 'Completed', date: '2026-08-26' },
  { id: '#ORD-004', customer: 'Emily Davis', amount: 'RWF 120,000', status: 'Cancelled', date: '2026-08-26' },
  { id: '#ORD-005', customer: 'Michael Wilson', amount: 'RWF 34,000', status: 'Completed', date: '2026-08-25' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
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
          <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center justify-between">
              {stat.label}
              <span className="text-slate-400 text-lg leading-none">⋮</span>
            </h3>
            <div className="mt-2 flex items-end justify-between overflow-hidden">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap truncate" title={stat.value}>
                {stat.value}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
               <span className={`font-medium ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
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
              <BarChart data={incomeVsExpensesData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
              <LineChart data={profitVsInvestmentData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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

      {/* Recent Orders Table Summary */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-slate-900">Recent Orders Summary</h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentOrders.map((order, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-500">{order.date}</td>
                  <td className="px-6 py-4 font-medium text-right">{order.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
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
