import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Search, AlertCircle, ArrowDownToLine, ArrowUpFromLine, Calendar, Info, Clock, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

interface ProductBatch {
  id: number;
  quantity: number;
  expiration_date: string;
  status: string;
}

interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: string;
  stock_quantity: number;
  batches?: ProductBatch[];
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'status' | 'in' | 'out'>('status');
  
  // Stock In State
  const [stockInForm, setStockInForm] = useState({ product_id: '', quantity: '', expiration_date: '' });
  
  // Stock Out State
  const [stockOutForm, setStockOutForm] = useState({ product_id: '', quantity: '', reason: 'Damaged' });

  // Add Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', sku: '', price: '', stock_quantity: '0' });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (payload: typeof productForm) => {
      const res = await api.post('/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
    }
  });

  const stockInMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/stock/in', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockInForm({ product_id: '', quantity: '', expiration_date: '' });
      alert('Stock successfully recorded!');
      setActiveTab('status');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to record stock in.');
    }
  });

  const stockOutMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/stock/out', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockOutForm({ product_id: '', quantity: '', reason: 'Damaged' });
      alert('Stock successfully removed!');
      setActiveTab('status');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to record stock out.');
    }
  });

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInForm.product_id || !stockInForm.quantity || !stockInForm.expiration_date) return;
    stockInMutation.mutate({
      product_id: parseInt(stockInForm.product_id),
      quantity: parseInt(stockInForm.quantity),
      expiration_date: stockInForm.expiration_date
    });
  };

  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockOutForm.product_id || !stockOutForm.quantity || !stockOutForm.reason) return;
    stockOutMutation.mutate({
      product_id: parseInt(stockOutForm.product_id),
      quantity: parseInt(stockOutForm.quantity),
      reason: stockOutForm.reason
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate(productForm);
  };

  const getExpirationStatus = (batches?: ProductBatch[]) => {
    if (!batches || batches.length === 0) return null;
    const earliest = batches[0];
    const expDate = new Date(earliest.expiration_date);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { text: 'Expired', color: 'text-red-600 bg-red-100' };
    if (diffDays <= 30) return { text: `Expires in ${diffDays} days`, color: 'text-orange-600 bg-orange-100' };
    return { text: new Date(earliest.expiration_date).toLocaleDateString(), color: 'text-slate-500 bg-slate-100' };
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" /> Advanced Stock Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage inventory, record incoming stock, and log damages/expirations.</p>
        </div>
        <button 
          onClick={() => {
            setProductForm({ name: '', sku: '', price: '', stock_quantity: '0' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus size={18} /> New Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl w-full sm:w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'status' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Info size={16}/> Stock Status
        </button>
        <button 
          onClick={() => setActiveTab('in')}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'in' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <ArrowDownToLine size={16}/> Stock In
        </button>
        <button 
          onClick={() => setActiveTab('out')}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'out' ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <ArrowUpFromLine size={16}/> Stock Out
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {activeTab === 'status' && (
          <div className="flex flex-col h-[calc(100vh-320px)]">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Product Name</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">SKU</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Price (RWF)</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Stock Level</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Next Expiration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products?.map((product: Product) => {
                    const expStatus = getExpirationStatus(product.batches);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{product.name}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-sm">
                          {product.sku || '-'}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900">
                          {parseFloat(product.price).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                            ${product.stock_quantity > 20 ? 'bg-green-100 text-green-700' : 
                              product.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {product.stock_quantity <= 20 && <AlertCircle size={14} />}
                            {product.stock_quantity} in stock
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {expStatus ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${expStatus.color}`}>
                              <Clock size={12} /> {expStatus.text}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">No batches</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {products?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No products found. Add a new product first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'in' && (
          <form onSubmit={handleStockInSubmit} className="p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ArrowDownToLine className="text-blue-600" /> Record Incoming Stock
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Product <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={stockInForm.product_id}
                  onChange={e => setStockInForm({...stockInForm, product_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">-- Select Product --</option>
                  {products?.map((p: Product) => (
                    <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock_quantity})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity Added <span className="text-red-500">*</span></label>
                  <input 
                    type="number" min="1" required
                    value={stockInForm.quantity}
                    onChange={e => setStockInForm({...stockInForm, quantity: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" /> Expiration Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" required
                    value={stockInForm.expiration_date}
                    onChange={e => setStockInForm({...stockInForm, expiration_date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="submit"
                  disabled={stockInMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {stockInMutation.isPending ? 'Processing...' : 'Confirm Stock In'}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'out' && (
          <form onSubmit={handleStockOutSubmit} className="p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ArrowUpFromLine className="text-red-600" /> Record Stock Out (Removals)
            </h2>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-red-800">
                Use this form to remove stock that was <strong>NOT sold via POS</strong> (e.g., Expired, Damaged, Stolen, or Administrative Corrections).
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Product <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={stockOutForm.product_id}
                  onChange={e => setStockOutForm({...stockOutForm, product_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                >
                  <option value="">-- Select Product --</option>
                  {products?.map((p: Product) => (
                    <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock_quantity})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity Removed <span className="text-red-500">*</span></label>
                  <input 
                    type="number" min="1" required
                    value={stockOutForm.quantity}
                    onChange={e => setStockOutForm({...stockOutForm, quantity: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reason <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={stockOutForm.reason}
                    onChange={e => setStockOutForm({...stockOutForm, reason: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  >
                    <option value="Damaged">Damaged / Broken</option>
                    <option value="Expired">Expired</option>
                    <option value="Lost">Lost / Stolen</option>
                    <option value="Correction">Administrative Correction</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="submit"
                  disabled={stockOutMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {stockOutMutation.isPending ? 'Processing...' : 'Confirm Stock Out'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>

      {/* Add Base Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add New Product Catalog Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1"><X size={20}/></button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg">
                  This creates the product profile. After creating it, use the <strong>Stock In</strong> tab to add actual quantities and expiration dates.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (RWF) *</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-600">Cancel</button>
                <button type="submit" disabled={createProductMutation.isPending} className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-xl">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
